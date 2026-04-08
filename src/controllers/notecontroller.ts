import Note from "../models/noteModel.js";
import Client from "../models/clientModel.js";

export const getClientNotes = async (req: any, res: any) => {
  try {
    const clientId = req.params.clientId || req.params.id;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const notes = await Note.find({
      clientId,
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

export const addNote = async (req: any, res: any) => {
  try {
    const clientId = req.params.clientId || req.params.id;

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const note = await Note.create({
      content: req.body.content,
      clientId: client._id,
      userId: req.user.id,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({ message: "Error adding note" });
  }
};

export const deleteNote = async (req: any, res: any) => {
  try {
    const noteId = req.params.noteId;
    const clientId = req.params.clientId || req.params.id;

    if (!clientId || !noteId) {
      return res.status(400).json({ message: "Client ID and Note ID are required" });
    }

    const client = await Client.findOne({
      _id: clientId,
      userId: req.user.id,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const note = await Note.findOneAndDelete({
      _id: noteId,
      clientId,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
};
