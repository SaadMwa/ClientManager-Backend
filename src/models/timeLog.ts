import mongoose, { Document, Schema } from "mongoose";

export interface ITimeLog extends Document {
  userId: string;
  projectId: string;
  hoursWorked: number;
  description?: string;
  date: Date;
  createdAt: Date;
}

const timeLogSchema = new Schema<ITimeLog>({
  userId: { type: String, required: true },
  projectId: { type: String, required: true },
  hoursWorked: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITimeLog>("TimeLog", timeLogSchema);