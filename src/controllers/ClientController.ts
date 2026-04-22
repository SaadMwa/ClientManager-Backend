import type { Request, Response } from "express";
import Note from "../models/noteModel.js"
import Client from "../models/clientModel.js"

// Create client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { name, email} = req.body;
    
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Client name is required" });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Client email is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }    


    const client = await Client.create({
      name,
      userId: req.user.id,
      email: email
    });

    res.status(201).json(client);
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Clients for a user
export const getClients = async(req: any, res: any) => {
  try{
     const Page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    const query = {
      userId: req.user.id,
      name: { $regex: search, $options: "i" },
    };

     const total = await Client.countDocuments(query);

    const clients = await Client.find(query)
      .skip((Page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      clients,
      total,
      page: Page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ message: "Error fetching clients" });
  }
};


// Get single client
export const getClientById = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const client = await Client.findById(req.params.id);
    
    // Check if client exists AND belongs to user
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    if (client.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this client" });
    }
    
    res.json(client);
  } catch (error) {
    console.error("Get client by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update client
export const updateClient = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
     if (req.body.name === undefined || !String(req.body.name).trim()) {
      return res.status(400).json({ message: "Client name is required" });
    }

    if (req.body.email === undefined || !String(req.body.email).trim()) {
      return res.status(400).json({ message: "Client email is required" });
    }
    if (!req.params.id) {
      return res.status(400).json({ message: "Client ID is required" });
    }
    
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name: req.body.name, email: req.body.email },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    res.json(client);
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete client
export const deleteClient = async (req: Request, res: Response) => {
    try{
        if (!req.user?.id) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        if (!req.params.id) {
          return res.status(400).json({ message: "Client ID is required" });
        }
        
        const client = await Client.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.id
        });
        
        if (!client) {
          return res.status(404).json({ message: "Client not found" });
        }

        // Clean up orphaned notes for this client
        await Note.deleteMany({
          clientId: client._id,
          userId: req.user.id,
        });
        
        res.json({ message: "Client deleted successfully" });
    } catch(error){
        console.error("Delete client error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
}


// In clientController.js - UPDATE THIS FUNCTION
export const getDashboardStats = async(req: any, res: any) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Get total clients
    const totalClients = await Client.countDocuments({
      userId: req.user.id
    });

    // Get total notes only for active clients to avoid orphaned notes
    const clientIds = await Client.find({ userId: req.user.id }).distinct("_id");
    const totalNotes = await Note.countDocuments({
      userId: req.user.id,
      clientId: { $in: clientIds },
    });


    // Get recent clients (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentClients = await Client.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: oneWeekAgo },
    });
    
    res.json({
      totalClients,
      totalNotes,
      recentClients,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ 
      message: "Error fetching stats", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};
