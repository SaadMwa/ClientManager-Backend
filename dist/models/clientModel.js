import mongoose, { Document, Schema } from "mongoose";
const clientSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
export default mongoose.model("Client", clientSchema);
//# sourceMappingURL=clientModel.js.map