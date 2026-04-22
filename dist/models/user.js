import mongoose, { Document, Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("User", userSchema);
//# sourceMappingURL=user.js.map