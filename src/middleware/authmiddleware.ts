import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  // support both cookie-based and header-based tokens
  let token = req.cookies.token as string | undefined;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = { id: decoded.userId }; // attach userId to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};