import express from "express";
import TeamMember from "../models/TeamMember.js";

const router = express.Router();

// Get all active team members
router.get("/", async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true })
      .sort({ priority: 1, name: 1 })
      .select("-updatedAt");

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
