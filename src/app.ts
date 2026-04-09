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
import Notes from "./routes/clientroutes.js";
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
app.use(
  cors({
    origin:["http://localhost:5173", "https://client-manager-frontend-vwyz.vercel.app"],
    credentials: true,
  })
);

app.use(cookieParser());

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (all client routes are protected in their file)
app.use("/api", clientRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/timelogs", timeLogRoutes);
app.use("/api/notes", Notes);
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

let cachedConnection: Promise<typeof mongoose> | null = null;

export async function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cachedConnection) {
    cachedConnection = mongoose.connect(process.env.MONGO_URI as string);
  }

  return cachedConnection;
}

export { app };
