import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";

export interface JwtPayload {
    userId: number;
    email: string;
    role: string | null;
}

export const generateTokens = (payload: JwtPayload) => {
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    } catch (error) {
        return null;
    }
};
