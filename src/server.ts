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
import Notes from "./routes/clientroutes.js"
import AnalyticsRoutes from "./routes/analytic.js"


// Ensure .env is loaded even if the server is started from a different CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || process.env.CLIENT_URI || "http://localhost:5173",
    credentials: true
}));


app.use(cookieParser());

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (all client routes are protected in their file)
app.use("/api", clientRoutes); 

app.use("/api/projects", projectRoutes);
app.use("/api/timelogs", timeLogRoutes);
app.use("/api/notes", Notes);
app.use("/api/analytics",AnalyticsRoutes )


// Test route (protected)
app.get("/api/test-auth", protect, (req, res) => {
  res.json({ 
    message: "Authentication working!",
    userId: req.user?.id 
  });
});

// Health check
app.get("/", (req, res) => {
    res.send("Server is running")
});

// Database connection and server start
const Port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(Port, () => {
            console.log(`🚀 Server is running on port ${Port}`);
        });
    })
    .catch((err) => {
        console.error("❌ Failed to connect to MongoDB", err);
    });
