import Product from "../models/Product.js";
import path from "path";

const toPublicPath = (p) => {
  // make sure it’s served by express.static("/uploads", ...)
  // normalize slashes for windows
  const norm = p.replace(/\\/g, "/");
  // ensure it starts with /uploads/
  const idx = norm.indexOf("/uploads/");
  return idx >= 0
    ? norm.slice(idx)
    : `/uploads/products/${path.basename(norm)}`;
};

const toNumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const toBool = (v, d = false) => {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return d;
  return ["true", "1", "yes", "on"].includes(v.toLowerCase());
};

// ---------- ADMIN ----------
export const adminListProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
    const q = (req.query.q || "").trim();

    const filter = {};
    if (q) filter.$text = { $search: q };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      descriptionHtml,
      categoryId,
      brandId,
      priceMrp,
      priceSell,
      currency,
      stockQty,
      lowStockThreshold,
      allowBackorder,
      isActive,
      isFeatured,
      badges,
      tags,
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!priceMrp || !priceSell)
      return res
        .status(400)
        .json({ message: "priceMrp and priceSell are required" });

    const images =
      (req.files || []).map((f, idx) => ({
        path: toPublicPath(f.path),
        alt: "",
        isPrimary: idx === 0,
      })) ?? [];

    const product = await Product.create({
      name,
      sku: sku || undefined,
      descriptionHtml,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,

      priceMrp: toNumber(priceMrp),
      priceSell: toNumber(priceSell),
      currency: currency || "INR",

      stockQty: toNumber(stockQty),
      lowStockThreshold: toNumber(lowStockThreshold, 10),
      allowBackorder: toBool(allowBackorder, false),

      images,

      badges: Array.isArray(badges) ? badges : badges ? [badges] : [],
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],

      isActive: toBool(isActive, true),
      isFeatured: toBool(isFeatured, false),
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct:", err);
    res
      .status(500)
      .json({ message: err.message || "Unable to create product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const payload = {
      ...req.body,
      priceMrp: req.body.priceMrp ? toNumber(req.body.priceMrp) : undefined,
      priceSell: req.body.priceSell ? toNumber(req.body.priceSell) : undefined,
      stockQty: req.body.stockQty ? toNumber(req.body.stockQty) : undefined,
      lowStockThreshold: req.body.lowStockThreshold
        ? toNumber(req.body.lowStockThreshold)
        : undefined,
      allowBackorder:
        typeof req.body.allowBackorder !== "undefined"
          ? toBool(req.body.allowBackorder)
          : undefined,
      isActive:
        typeof req.body.isActive !== "undefined"
          ? toBool(req.body.isActive)
          : undefined,
      isFeatured:
        typeof req.body.isFeatured !== "undefined"
          ? toBool(req.body.isFeatured)
          : undefined,
    };

    // append new images if uploaded
    if (req.files?.length) {
      const add = req.files.map((f) => ({
        path: toPublicPath(f.path),
        alt: "",
        isPrimary: false,
      }));
      payload.$push = { images: { $each: add } };
    }

    const updated = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Product.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
