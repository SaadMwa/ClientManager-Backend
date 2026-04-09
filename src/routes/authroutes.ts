import express from "express";
import {LoginUser, registerUser, getMe, logout} from "../controllers/authcontroller.js"
import { protect } from "../middleware/authmiddleware.js";
import { testAuthFunction } from "../controllers/authcontroller.js";

const router = express.Router();
router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working' });
});

router.post("/register", registerUser);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.get('/test-function', testAuthFunction);
router.post("/login", LoginUser);

export default router;
