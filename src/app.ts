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
import { getAllowedOrigins, validateEnvironment } from "./config/env.js";

// Ensure .env is loaded even if the server is started from a different CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// Middleware
app.use(express.json({ limit: "100kb" }));
app.use((req, _res, next) => {
  const startedAt = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  req.on("close", () => {
    const elapsed = Date.now() - startedAt;
    console.log(`[${req.method}] ${req.path} completed in ${elapsed}ms`);
  });
  next();
});

const requestBuckets = new Map<string, { count: number; startedAt: number }>();
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
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();
      const devOrigins = process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"];
      const allowlist = [...allowedOrigins, ...devOrigins];

      if (!origin || allowlist.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
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

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed" });
  }
  console.error("Unhandled server error", error.name);
  return res.status(500).json({ message: "Internal server error" });
});

let cachedConnection: Promise<typeof mongoose> | null = null;

export async function connectToDatabase() {
  validateEnvironment();

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

export async function disconnectFromDatabase() {
  cachedConnection = null;
  await mongoose.disconnect();
}

export { app };
