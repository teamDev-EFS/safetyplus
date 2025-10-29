// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    // Prefer Authorization: Bearer <token>, fallback to cookie "token"
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookieToken = req.cookies?.token;
    const token = bearer || cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub || decoded.userId;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user; // attach sanitized user doc
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Optional authenticate: attach req.user if token is valid, otherwise continue as guest
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookieToken = req.cookies?.token;
    const token = bearer || cookieToken;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub || decoded.userId;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user || !user.isActive) {
      return next();
    }

    req.user = user;
    return next();
  } catch (_err) {
    // Ignore token errors for optional auth and proceed as guest
    return next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Authentication required" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Access denied" });
    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
};
