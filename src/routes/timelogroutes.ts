import express from "express";
import {
  CreateLogTime,
  GetTimeLogsByProject
} from "../controllers/timeComtroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/", protect, CreateLogTime);
router.get("/:projectId", protect, GetTimeLogsByProject);

export default router;