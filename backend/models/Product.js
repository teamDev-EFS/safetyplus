import mongoose from "mongoose";
import slugify from "slugify";

const productImageSchema = new mongoose.Schema(
  {
    path: { type: String, required: true }, // public-facing path e.g. /uploads/products/xxx.webp
    alt: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSpecSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true },
    value: { type: String, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },

    descriptionHtml: { type: String, default: "" },
    specs: [productSpecSchema],
    attributes: {
      type: Map,
      of: [String],
    },

    priceMrp: { type: Number, required: true, min: 0 },
    priceSell: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },

    stockQty: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    allowBackorder: { type: Boolean, default: false },

    images: { type: [productImageSchema], default: [] },

    badges: [String],
    tags: [String],

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    viewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// indexes
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ brandId: 1, isActive: 1 });
productSchema.index({ name: "text", tags: "text", descriptionHtml: "text" });

// helpers
function ensureSKU(doc) {
  if (doc.sku) return;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  doc.sku = `SP-${Date.now().toString().slice(-6)}-${rand}`;
}

async function ensureUniqueSlug(doc) {
  if (doc.slug) return;
  const base = slugify(doc.name || "product", { lower: true, strict: true });
  let slug = base;
  let i = 1;
  // @ts-ignore
  while (await mongoose.models.Product.exists({ slug })) {
    slug = `${base}-${i++}`;
  }
  doc.slug = slug;
}

productSchema.pre("validate", async function (next) {
  try {
    ensureSKU(this);
    await ensureUniqueSlug(this);
    next();
  } catch (e) {
    next(e);
  }
});

productSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Product", productSchema);
