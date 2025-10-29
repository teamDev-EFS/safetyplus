import express from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get wishlist
router.get("/", authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, items: [] });
    }

    // Transform the data to match frontend expectations
    const transformedItems = wishlist.items
      .filter((item) => item.productId) // Filter out items with null productId
      .map((item) => ({
        productId: item.productId._id,
        addedAt: item.addedAt,
        product: item.productId, // The populated product data
      }));

    res.json({
      items: transformedItems,
      userId: wishlist.userId,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post("/add", authenticate, async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, items: [] });
    }

    const exists = wishlist.items.some(
      (item) => item.productId.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({ productId, addedAt: new Date() });
      wishlist.updatedAt = new Date();
      await wishlist.save();
    }

    res.json({ ok: true, count: wishlist.items.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete("/remove/:productId", authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });

    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) => item.productId.toString() !== req.params.productId
      );
      wishlist.updatedAt = new Date();
      await wishlist.save();
    }

    res.json({ ok: true, count: wishlist?.items.length || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear wishlist
router.delete("/clear", authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (wishlist) {
      wishlist.items = [];
      wishlist.updatedAt = new Date();
      await wishlist.save();
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
