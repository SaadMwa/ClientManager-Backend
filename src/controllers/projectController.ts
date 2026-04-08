//@ts-nocheck
import type { Request, Response } from 'express';
import Project from '../models/projectModel.js';
import { calculateProfit } from '../services/profitService.js';
import type { get } from 'node:http';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { clientId, name, estimatedHours, agreedPrice } = req.body;

        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized - user not found" });
        }

        if (!clientId || !name || !estimatedHours || !agreedPrice) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const project = await Project.create({
            name,
            clientId,
            userId: req.user.id,
            estimatedHours,
            agreedPrice
        });

        return res.status(201).json(project);
    } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({ message: "Error creating project", error });
    }
}

export const getProjects = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized - user not found" });
        }

        const projects = await Project.find({ userId: req.user.id });
        
        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: "No projects found for this user" });
        }
        
        return res.status(200).json(projects);
    } catch (error) {
        console.error("Get projects error:", error);
        res.status(500).json({ message: "Error fetching projects", error });
    }
}

export const getSingleProject = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized - user not found" });
        }

        const singleProject = await Project.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!singleProject) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        return res.status(200).json(singleProject);
    } catch (error) {
        console.error("Get single project error:", error);
        res.status(500).json({ message: "Error fetching project", error });
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized - user not found" });
        }
        
        const deletedProject = await Project.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!deletedProject) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error("Delete project error:", error);
        res.status(500).json({ message: "Error deleting project", error });
    }
}

export const updateProject = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized - user not found" });
        }

        
        const { name, estimatedHours, agreedPrice, status} = req.body;
        let completedAt = null
        
        if(status === "completed"){
            completedAt = new Date();
        }
        
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { name, estimatedHours, agreedPrice, status, completedAt},
            { new: true }
        );

      
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        
        res.json(project);
    } catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getProjectProfit = async (req: Request, res: Response) => {
      try {
    const metrics = await calculateProjectMetrics(
      req.params.id,
      req.user!.id
    );

    res.json(metrics);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export default getProjectProfit;