import express from "express";
import {LoginUser, registerUser, getMe, logout} from "../controllers/authcontroller.js"
import { protect } from "../middleware/authmiddleware.js";
import { testAuthFunction } from "../controllers/authcontroller.js";

const router = express.Router();

const authBuckets = new Map<string, { count: number; startedAt: number }>();
const authRateLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const max = 20;
    const bucket = authBuckets.get(key);

    if (!bucket || now - bucket.startedAt > windowMs) {
        authBuckets.set(key, { count: 1, startedAt: now });
        return next();
    }

    if (bucket.count >= max) {
        return res.status(429).json({ message: "Too many authentication attempts. Please try again later." });
    }

    bucket.count += 1;
    authBuckets.set(key, bucket);
    return next();
};

router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working' });
});

router.post("/register", authRateLimit, registerUser);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.get('/test-function', testAuthFunction);
router.post("/login", authRateLimit, LoginUser);

export default router;
