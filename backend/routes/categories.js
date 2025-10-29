import express from "express";
import Category from "../models/Category.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select(
        "name slug description parentId imagePath sortOrder isActive createdAt"
      );

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new category (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, parentId, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || "",
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
      isActive: true,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (admin only)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId, sortOrder, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug already exists (excluding current category)
    const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description: description || "",
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== false,
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const Product = (await import("../models/Product.js")).default;
    const productCount = await Product.countDocuments({ categoryId: id });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It has ${productCount} product(s) associated with it.`,
      });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by slug
router.get("/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
