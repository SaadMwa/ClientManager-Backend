import type { Response, Request } from "express";
import User from "../models/user.js";
import { generateTokens } from "../utilities/generatetokens.js";
import bcrypt from "bcrypt";



export const registerUser = async (req: Request, res: Response) => {
    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: "All Fields are required"});
        }

        const ExistingUser = await User.findOne({email});
        if(ExistingUser){
            return res.status(400).json ({message: "User Already Exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const HashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({name, email, password: HashedPassword});

        const userWithoutPassword = await User.findById(newUser._id).select("-password");
        return res.status(201).json({message: "User Registered Successfully", user: userWithoutPassword})
    } catch (error: any){
        console.error("Register error:", error);
        if (error?.code === 11000) {
            return res.status(400).json({ message: "User Already Exists" });
        }
        if (error?.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const LoginUser = async (req: Request, res: Response) => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "All Fields are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        // generate JWT token
        const token = generateTokens(user._id.toString());
        if (!token) {
            return res.status(500).json({ message: "Token generation failed" });
        }
        
        // set cookie for traditional auth middleware
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:  process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 60 * 60 * 1000, // 1 hour
        });
        
        const userWithoutPassword = await User.findById(user._id).select("-password");

        // return token in body so frontend can store/use it if desired
        return res.status(200).json({ 
            message: "Logged in successfully",
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

export const getMe = async (req: any, res: any) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};
