import mongoose from "mongoose";
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Note content is required"],
        trim: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client", // 👈 This creates the relationship!
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // 👈 So we know who wrote it
        required: true
    }
}, {
    timestamps: true // 👈 Auto adds createdAt and updatedAt
});
// Create and export the model
const Note = mongoose.model("Note", noteSchema);
export default Note;
//# sourceMappingURL=noteModel.js.map