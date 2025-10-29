import express from "express";
import Branch from "../models/Branch.js";

const router = express.Router();

// Get all active branches
router.get("/", async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).sort({ city: 1 });

    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
