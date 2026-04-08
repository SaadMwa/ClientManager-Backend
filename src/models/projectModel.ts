import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  userId: string;
  clientId: string;
  name: string;
  estimatedHours: number;
  agreedPrice: number;
  status: "active" | "completed";
  createdAt: Date;
  updatedAt: Date;  // 👈 Add this to interface
  completedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true },
    clientId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    estimatedHours: { type: Number, required: true },
    agreedPrice: { type: Number, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    completedAt: { type: Date, default: null }
  },
  {
    timestamps: true  // 👈 This goes HERE, as a second parameter
  }
);

export default mongoose.model<IProject>("Project", projectSchema);