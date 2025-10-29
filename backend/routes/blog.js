import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 12, tag, q } = req.query;

    const filter = { isPublished: true };
    if (tag) {
      filter.tags = tag;
    }
    if (q) {
      filter.$text = { $search: q };
    }

    const posts = await Post.find(filter)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post by slug
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      isPublished: true,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
