import type { Request, Response } from "express";
import timeLog from "../models/timeLog.js";

export const CreateLogTime = async (req: Request, res: Response) => {

    if(!req.user){
        return res.status(401).json({message: "Unauthorized"});
    }

     try{
        const {projectId, hoursWorked, description, date} = req.body;

        if(!projectId || !hoursWorked || !date){
            return res.status(400).json({message: "Project ID, Hours Worked and Date are required"});
        }

        const newTimeLog = await timeLog.create({
             userId: req.user?.id,
             projectId,
             hoursWorked,
             description,
             date
        });     
        res.status(201).json(newTimeLog);
     } catch (error) {
        res.status(500).json({message: "Error logging time"});
     }
}


export const GetTimeLogsByProject = async (req: Request, res: Response) => {
 
    try{
           if(!req.user || req.user.id !== req.params.userId){
        return res.status(401).json({message: "Unauthorized"});
    }
        // params may be string | string[] | undefined from Express
        const projectId = req.params.projectId;
        const userId = req.params.userId;

        if (!projectId || Array.isArray(projectId) || !userId || Array.isArray(userId)) {
            return res.status(400).json({ message: 'Invalid project or user id' });
        }

        const logs = await timeLog.find({
            projectId,
            userId
        });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({message: "Error fetching time logs"});
    }
}