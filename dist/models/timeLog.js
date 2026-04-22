import mongoose, { Document, Schema } from "mongoose";
const timeLogSchema = new Schema({
    userId: { type: String, required: true },
    projectId: { type: String, required: true },
    hoursWorked: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("TimeLog", timeLogSchema);
//# sourceMappingURL=timeLog.js.map