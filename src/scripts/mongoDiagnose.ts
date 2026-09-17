import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import { classifyMongoError } from "../utils/safeMongoError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const validateMongoUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing");
  }
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGO_URI is malformed");
  }
  try {
    const parsed = new URL(uri);
    if (!parsed.hostname) throw new Error("Missing hostname");
    return parsed.hostname;
  } catch {
    throw new Error("MONGO_URI is malformed");
  }
};

const main = async () => {
  try {
    const hostname = validateMongoUri();
    console.log("MongoDB diagnostic");
    console.log("- MONGO_URI: present");
    console.log(`- Hostname: ${hostname ? "present" : "missing"} (value redacted)`);
    console.log("- Attempting short connection test...");

    await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    await mongoose.connection.db?.admin().ping();
    console.log("- Result: connection OK");
  } catch (error) {
    console.error(`- Result: ${classifyMongoError(error)}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
};

void main();
