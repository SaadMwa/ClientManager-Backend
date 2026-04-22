import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { protect } from "./middleware/authmiddleware.js";
import authRoutes from "./routes/authroutes.js";
import clientRoutes from "./routes/clientroutes.js";
import projectRoutes from "./routes/projectroutes.js";
import timeLogRoutes from "./routes/timelogroutes.js";
import AnalyticsRoutes from "./routes/analytic.js";
// Ensure .env is loaded even if the server is started from a different CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const app = express();
// Add this BEFORE all other routes
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});
// Middleware
app.use(express.json());
app.use((req, _res, next) => {
    const startedAt = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    req.on("close", () => {
        const elapsed = Date.now() - startedAt;
        console.log(`[${req.method}] ${req.originalUrl} completed in ${elapsed}ms`);
    });
    next();
});
const requestBuckets = new Map();
app.use((req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const max = 300;
    const bucket = requestBuckets.get(key);
    if (!bucket || now - bucket.startedAt > windowMs) {
        requestBuckets.set(key, { count: 1, startedAt: now });
        return next();
    }
    if (bucket.count >= max) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
    }
    bucket.count += 1;
    requestBuckets.set(key, bucket);
    return next();
});
app.use(cors({
    origin: ["http://localhost:5173", "https://client-manager-frontend-vwyz.vercel.app"],
    credentials: true,
}));
app.use(cookieParser());
// Public Routes
app.use("/api/auth", authRoutes);
// Protected Routes (all client routes are protected in their file)
app.use("/api", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timelogs", timeLogRoutes);
app.use("/api/analytics", AnalyticsRoutes);
// Test route (protected)
app.get("/api/test-auth", protect, (req, res) => {
    res.json({
        message: "Authentication working!",
        userId: req.user?.id,
    });
});
// Health check
app.get("/", (req, res) => {
    res.send("Server is running");
});
let cachedConnection = null;
export async function connectToDatabase() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set");
    }
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }
    if (!cachedConnection) {
        cachedConnection = mongoose.connect(process.env.MONGO_URI);
    }
    return cachedConnection;
}
export { app };
//# sourceMappingURL=app.js.map