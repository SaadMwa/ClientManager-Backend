import express from "express";
import { createClient, getClients, getClientById, deleteClient, updateClient, getDashboardStats, } from "../controllers/ClientController.js";
import { getClientNotes, deleteNote, addNote, } from "../controllers/notecontroller.js";
import { protect } from "../middleware/authmiddleware.js";
const router = express.Router();
router.post("/clients", protect, createClient);
router.get("/clients", protect, getClients);
router.get("/clients/stats", protect, getDashboardStats);
router.get("/clients/:id", protect, getClientById);
router.delete("/clients/:id", protect, deleteClient);
router.put("/clients/:id", protect, updateClient);
router.get("/clients/:clientId/notes", protect, getClientNotes);
router.post("/clients/:clientId/notes", protect, addNote);
router.delete("/clients/:clientId/notes/:noteId", protect, deleteNote);
export default router;
//# sourceMappingURL=clientroutes.js.map