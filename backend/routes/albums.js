import express from "express";
import Album from "../models/Album.js";

const router = express.Router();

// Get all albums
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, tag } = req.query;

    const filter = { isActive: true };
    if (tag) {
      filter.tags = tag;
    }

    const albums = await Album.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Album.countDocuments(filter);

    res.json({
      albums,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single album by slug
router.get("/:slug", async (req, res) => {
  try {
    const album = await Album.findOne({ slug: req.params.slug });

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
