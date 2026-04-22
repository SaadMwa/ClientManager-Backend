import Project from "../models/projectModel.js";
import { calculateProfit } from "../services/profitService.js";
export const createProject = async (req, res) => {
    try {
        const { clientId, name, estimatedHours, agreedPrice } = req.body;
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        if (!clientId || !name) {
            return res.status(400).json({ message: "Client and project name are required" });
        }
        if (Number(estimatedHours) < 0 || Number(agreedPrice) < 0) {
            return res.status(400).json({ message: "Hours and price must be positive values" });
        }
        const project = await Project.create({
            name,
            clientId,
            userId: req.user.id,
            estimatedHours: Number(estimatedHours || 0),
            agreedPrice: Number(agreedPrice || 0),
        });
        return res.status(201).json(project);
    }
    catch (error) {
        console.error("Create project error", error);
        return res.status(500).json({ message: "Error creating project" });
    }
};
export const getProjects = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const projects = await Project.find({ userId: req.user.id });
        return res.status(200).json(projects);
    }
    catch (error) {
        console.error("Get projects error", error);
        return res.status(500).json({ message: "Error fetching projects" });
    }
};
export const getSingleProject = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const projectId = String(req.params.id || "");
        if (!projectId) {
            return res.status(400).json({ message: "Project ID is required" });
        }
        const singleProject = await Project.findOne({
            _id: projectId,
            userId: req.user.id,
        });
        if (!singleProject) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.status(200).json(singleProject);
    }
    catch (error) {
        console.error("Get single project error", error);
        return res.status(500).json({ message: "Error fetching project" });
    }
};
export const deleteProject = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const projectId = String(req.params.id || "");
        if (!projectId) {
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
    }
    catch (error) {
        console.error("Delete project error", error);
        return res.status(500).json({ message: "Error deleting project" });
    }
};
export const updateProject = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const projectId = String(req.params.id || "");
        if (!projectId) {
            return res.status(400).json({ message: "Project ID is required" });
        }
        const { name, estimatedHours, agreedPrice, status } = req.body;
        const completedAt = status === "completed" ? new Date() : null;
        const project = await Project.findOneAndUpdate({ _id: projectId, userId: req.user.id }, {
            name,
            estimatedHours: Number(estimatedHours || 0),
            agreedPrice: Number(agreedPrice || 0),
            status,
            completedAt,
        }, { new: true });
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        return res.json(project);
    }
    catch (error) {
        console.error("Update project error", error);
        return res.status(500).json({ message: "Server error" });
    }
};
export const getProjectProfit = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const projectId = String(req.params.id || "");
        if (!projectId) {
            return res.status(400).json({ message: "Project ID is required" });
        }
        const metrics = await calculateProfit(projectId, req.user.id);
        return res.json(metrics);
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
export default getProjectProfit;
//# sourceMappingURL=projectController.js.map