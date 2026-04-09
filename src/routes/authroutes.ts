import express from "express";
import {LoginUser, registerUser, getMe, logout} from "../controllers/authcontroller.js"
import { protect } from "../middleware/authmiddleware.js";


const router = express.Router();
router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working' });
});

router.post("/register", registerUser);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

router.post("/login", LoginUser);

export default router;
