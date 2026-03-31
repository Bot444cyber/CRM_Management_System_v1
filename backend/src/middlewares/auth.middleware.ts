import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { db } from "../config/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// In-memory cache for throttling lastActive updates
const lastActiveCache = new Map<number, number>();

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        return;
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    const payload = verifyAccessToken(token);

    if (!payload) {
        res.status(401).json({ error: "Unauthorized: Token expired or invalid" });
        return;
    }

    req.user = payload;

    req.user = payload;

    // Throttled: Only update lastActive every 5 minutes
    const now = Date.now();
    const lastUpdate = lastActiveCache.get(payload.userId);
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (payload.userId && (!lastUpdate || now - lastUpdate > FIVE_MINUTES)) {
        lastActiveCache.set(payload.userId, now);
        db.update(users)
            .set({ lastActive: new Date() })
            .where(eq(users.id, payload.userId))
            .execute()
            .catch(err => {
                console.error("Error updating lastActive:", err);
                lastActiveCache.delete(payload.userId); // Allow retry on failure
            });
    }

    next();

};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role) {
            res.status(403).json({ error: "Forbidden: No valid user role" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden: Insufficient permissions" });
            return;
        }
        next();
    };
};
