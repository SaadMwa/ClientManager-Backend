import type { Request, Response } from "express";
import mongoose from "mongoose";
import Client from "../models/clientModel.js";
import Project from "../models/projectModel.js";
import { calculateProfit } from "../services/profitService.js";
import { getClientIdFromBody, parseOptionalDate } from "../utils/projectValidation.js";

const projectPopulate = {
  path: "clientId",
  select: "_id name email",
};

const findOwnedClient = async (clientId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return null;
  }
  return Client.findOne({ _id: clientId, userId });
};

const sendProject = async (res: Response, projectId: unknown, status = 200) => {
  const project = await Project.findById(projectId).populate(projectPopulate);
  return res.status(status).json(project);
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, estimatedHours, agreedPrice } = req.body;
    const clientId = getClientIdFromBody(req.body);
    const deadline = parseOptionalDate(req.body.deadline);

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    if (!clientId || !name || !String(name).trim()) {
      return res.status(400).json({ message: "Client and project name are required" });
    }
    if (deadline === "invalid") {
      return res.status(400).json({ message: "Deadline must be a valid date" });
    }

    const numericHours = Number(estimatedHours || 0);
    const numericPrice = Number(agreedPrice || 0);
    if (!Number.isFinite(numericHours) || !Number.isFinite(numericPrice) || numericHours < 0 || numericPrice < 0) {
      return res.status(400).json({ message: "Hours and price must be zero or greater" });
    }

    const client = await findOwnedClient(clientId, req.user.id);
    if (!client) {
      return res.status(400).json({ message: "Select one of your saved clients" });
    }

    const projectData: {
      name: string;
      clientId: mongoose.Types.ObjectId;
      userId: string;
      estimatedHours: number;
      agreedPrice: number;
      deadline?: Date | null;
    } = {
      name: String(name).trim(),
      clientId: client._id,
      userId: req.user.id,
      estimatedHours: numericHours,
      agreedPrice: numericPrice,
    };
    if (deadline !== undefined) {
      projectData.deadline = deadline;
    }

    const project = await Project.create(projectData);

    return sendProject(res, project._id, 201);
  } catch (error) {
    console.error("Create project error", error);
    return res.status(500).json({ message: "Error creating project" });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const projects = await Project.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate(projectPopulate);
    return res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error", error);
    return res.status(500).json({ message: "Error fetching projects" });
  }
};

export const getSingleProject = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const projectId = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const singleProject = await Project.findOne({
      _id: projectId,
      userId: req.user.id,
    }).populate(projectPopulate);

    if (!singleProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(singleProject);
  } catch (error) {
    console.error("Get single project error", error);
    return res.status(500).json({ message: "Error fetching project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const projectId = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      userId: req.user.id,
    });

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error", error);
    return res.status(500).json({ message: "Error deleting project" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const projectId = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const clientId = getClientIdFromBody(req.body);
    if (clientId) {
      const client = await findOwnedClient(clientId, req.user.id);
      if (!client) {
        return res.status(400).json({ message: "Select one of your saved clients" });
      }
      project.clientId = client._id;
    }

    if (req.body.name !== undefined) {
      const nextName = String(req.body.name).trim();
      if (!nextName) {
        return res.status(400).json({ message: "Project name is required" });
      }
      project.name = nextName;
    }

    if (req.body.estimatedHours !== undefined) {
      const nextHours = Number(req.body.estimatedHours);
      if (!Number.isFinite(nextHours) || nextHours < 0) {
        return res.status(400).json({ message: "Estimated hours must be zero or greater" });
      }
      project.estimatedHours = nextHours;
    }

    if (req.body.agreedPrice !== undefined) {
      const nextPrice = Number(req.body.agreedPrice);
      if (!Number.isFinite(nextPrice) || nextPrice < 0) {
        return res.status(400).json({ message: "Agreed price must be zero or greater" });
      }
      project.agreedPrice = nextPrice;
    }

    const deadline = parseOptionalDate(req.body.deadline);
    if (deadline === "invalid") {
      return res.status(400).json({ message: "Deadline must be a valid date" });
    }
    if (deadline !== undefined) {
      project.deadline = deadline;
    }

    if (req.body.status !== undefined) {
      if (!["active", "completed"].includes(String(req.body.status))) {
        return res.status(400).json({ message: "Status must be active or completed" });
      }
      const nextStatus = String(req.body.status) as "active" | "completed";
      if (nextStatus === "completed" && project.status !== "completed") {
        project.completedAt = new Date();
      }
      if (nextStatus === "active") {
        project.completedAt = null;
      }
      project.status = nextStatus;
    }

    await project.save();
    return sendProject(res, project._id);
  } catch (error) {
    console.error("Update project error", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getProjectProfit = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const projectId = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const metrics = await calculateProfit(projectId, req.user.id);
    return res.json(metrics);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to calculate project metrics";
    return res.status(400).json({ message });
  }
};

export default getProjectProfit;
