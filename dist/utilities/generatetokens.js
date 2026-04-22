import JWT from "jsonwebtoken";
export const generateTokens = (userId) => {
    try {
        const token = JWT.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return token;
    }
    catch (err) {
        console.error("Error generating token", err);
        return null;
    }
};
//# sourceMappingURL=generatetokens.js.map