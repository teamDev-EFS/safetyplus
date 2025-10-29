// routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import crypto from "crypto";

const router = express.Router();

const toUserDTO = (u) => ({
  id: u._id.toString(),
  email: u.email,
  name: u.name,
  phone: u.phone,
  role: u.role,
});

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" } // tune as needed
  );

const setTokenCookie = (res, token) => {
  // Optional (frontend uses Authorization header already)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// REGISTER (customers only)
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const user = await User.create({
      email,
      name,
      phone,
      role: "user",
      passwordHash: password, // will be hashed by pre-save
      isActive: true,
    });

    const token = signToken(user);
    setTokenCookie(res, token);

    res.status(201).json({ user: toUserDTO(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
});

// LOGIN (user or admin)
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    setTokenCookie(res, token);

    res.json({ user: toUserDTO(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
});

// ADMIN LOGIN (forces admin)
router.post("/admin/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin required." });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    setTokenCookie(res, token);

    res.json({ user: toUserDTO(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message || "Admin login failed" });
  }
});

// LOGOUT
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// CURRENT USER
router.get("/me", authenticate, async (req, res) => {
  // req.user is already sanitized by middleware
  res.json(toUserDTO(req.user));
});

// FORGOT PASSWORD (for general users only)
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email, role: "customer" });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real app, you would send an email here
    // For now, we'll return the token for testing
    const resetURL = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`;

    console.log(`Password reset URL for ${email}: ${resetURL}`);

    res.json({
      message: "If the email exists, a reset link has been sent",
      // Remove this in production - only for testing
      resetURL: process.env.NODE_ENV === "development" ? resetURL : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Failed to process password reset request" });
  }
});

// RESET PASSWORD
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      role: "customer",
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });
    }

    // Update password and clear reset token
    user.passwordHash = password;
    user.clearPasswordResetToken();
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;
