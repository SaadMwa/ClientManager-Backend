const requiredVars = ["MONGO_URI", "JWT_SECRET"] as const;

export const getAllowedOrigins = () => {
  const raw = process.env.CORS_ORIGINS || process.env.CLIENT_URL || "";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const validateEnvironment = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!String(process.env.MONGO_URI).startsWith("mongodb://") && !String(process.env.MONGO_URI).startsWith("mongodb+srv://")) {
    throw new Error("MONGO_URI must be a valid MongoDB connection string");
  }

  if (String(process.env.JWT_SECRET).length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  if (process.env.NODE_ENV === "production" && getAllowedOrigins().length === 0) {
    throw new Error("CORS_ORIGINS or CLIENT_URL must be set in production");
  }
};
