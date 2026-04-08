import express from 'express';
import {
    createProject,
    getProjects,
    getSingleProject,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authmiddleware.js';
import { getProjectProfit } from '../controllers/projectController.js';

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getSingleProject);
router.put("/:id", protect, updateProject);
router.delete("/:id", protect, deleteProject);
router.get("/:id/metrics", protect, getProjectProfit);


export default router;
