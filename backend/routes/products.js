import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// NOTE: featured route MUST come before "/:slug" or it'll be treated as a slug
router.get("/featured/list", async (_req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .limit(8);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products (search/filters/pagination/sorting)
router.get("/", async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      min,
      max,
      sort = "createdAt",
      page = 1,
      limit = 24,
    } = req.query;

    const filter = { isActive: true };

    if (q) filter.$text = { $search: q };
    if (category) filter.categoryId = category;
    if (brand) filter.brandId = brand;

    if (min || max) {
      filter.priceSell = {};
      if (min) filter.priceSell.$gte = parseInt(min);
      if (max) filter.priceSell.$lte = parseInt(max);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      "price-asc": { priceSell: 1 },
      "price-desc": { priceSell: -1 },
      name: { name: 1 },
      featured: { isFeatured: -1, createdAt: -1 },
      sold: { soldCount: -1 },
    };

    const products = await Product.find(filter)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .sort(sortOptions[sort] || { createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product by slug (keep last)
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("categoryId")
      .populate("brandId");

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.viewCount++;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
