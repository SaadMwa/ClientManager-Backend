// src/types/express.d.ts
import { User } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export {};