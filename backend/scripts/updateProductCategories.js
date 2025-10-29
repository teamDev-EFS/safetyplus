import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const updateExistingProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the first category (Safety Helmets)
    const defaultCategory = await Category.findOne({ slug: "safety-helmets" });
    if (!defaultCategory) {
      console.log(
        "No default category found. Please run seedCategories.js first."
      );
      process.exit(1);
    }

    // Update products that don't have a category or have null categoryId
    const result = await Product.updateMany(
      { $or: [{ categoryId: { $exists: false } }, { categoryId: null }] },
      { categoryId: defaultCategory._id }
    );

    console.log(
      `✅ Updated ${result.modifiedCount} products with default category: ${defaultCategory.name}`
    );

    // Show updated products
    const updatedProducts = await Product.find({
      categoryId: defaultCategory._id,
    })
      .populate("categoryId", "name slug")
      .select("name sku categoryId");

    console.log("\nUpdated products:");
    updatedProducts.forEach((product) => {
      console.log(
        `- ${product.name} (${product.sku}) -> ${product.categoryId?.name}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error updating products:", error);
    process.exit(1);
  }
};

updateExistingProducts();
