"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized — no token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch {
        return res.status(401).json({ message: "Not authorized — token invalid or expired" });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (req.userRole === "admin") {
        next();
    }
    else {
        res.status(403).json({ message: "Not authorized — admin access required" });
    }
};
exports.adminOnly = adminOnly;
//# sourceMappingURL=auth.middleware.js.map