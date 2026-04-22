import mongoose, { Document, Schema } from "mongoose";
const projectSchema = new Schema({
    userId: { type: String, required: true },
    clientId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    estimatedHours: { type: Number, required: true },
    agreedPrice: { type: Number, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    completedAt: { type: Date, default: null }
}, {
    timestamps: true // 👈 This goes HERE, as a second parameter
});
export default mongoose.model("Project", projectSchema);
//# sourceMappingURL=projectModel.js.map