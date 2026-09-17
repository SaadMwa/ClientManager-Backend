import mongoose, { Document, Schema, Types } from "mongoose";
const projectSchema = new Schema({
    userId: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    name: { type: String, required: true, trim: true },
    estimatedHours: { type: Number, required: true, min: 0 },
    agreedPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    deadline: { type: Date, default: null },
    completedAt: { type: Date, default: null },
}, {
    timestamps: true,
});
projectSchema.index({ userId: 1, clientId: 1 });
projectSchema.index({ userId: 1, status: 1, completedAt: 1 });
export default mongoose.model("Project", projectSchema);
//# sourceMappingURL=projectModel.js.map