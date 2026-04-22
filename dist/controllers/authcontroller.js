import bcrypt from "bcrypt";
import User from "../models/user.js";
import { generateTokens } from "../utilities/generatetokens.js";
export const testAuthFunction = async (_req, res) => {
    res.json({
        message: "Auth controller function is working",
        timestamp: new Date().toISOString(),
    });
};
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({ name, email, password: hashedPassword });
        const userWithoutPassword = await User.findById(newUser._id).select("-password");
        return res
            .status(201)
            .json({ message: "User registered successfully", user: userWithoutPassword });
    }
    catch (error) {
        console.error("Registration error", error);
        if (error?.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (error?.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = generateTokens(user._id.toString());
        if (!token) {
            return res.status(500).json({ message: "Token generation failed" });
        }
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const userWithoutPassword = await User.findById(user._id).select("-password");
        return res.status(200).json({
            message: "Logged in successfully",
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Login error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id).select("id email name");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
export const logout = async (_req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Logout failed" });
    }
};
//# sourceMappingURL=authcontroller.js.map