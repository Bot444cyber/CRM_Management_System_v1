"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        return;
    }
    const token = authHeader.split(" ")[1];
    const payload = (0, jwt_1.verifyAccessToken)(token);
    if (!payload) {
        res.status(401).json({ error: "Unauthorized: Token expired or invalid" });
        return;
    }
    req.user = payload;
    next();
};
exports.authenticate = authenticate;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
