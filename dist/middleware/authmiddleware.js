import jwt from "jsonwebtoken";
export const protect = (req, res, next) => {
    // support both cookie-based and header-based tokens
    let token = req.cookies.token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
    }
    if (!token)
        return res.status(401).json({ message: "Not authorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId }; // attach userId to request
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};
//# sourceMappingURL=authmiddleware.js.map