import JWT from "jsonwebtoken";

export const generateTokens = (userId: string): string | null => {
  try {
    const token = JWT.sign(
      { userId },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    return token;
  } catch (err) {
    console.error("Error generating token", err);
    return null;
  }
};
