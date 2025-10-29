import mongoose from "mongoose";
import Category from "../models/Category.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Sample categories
    const categories = [
      {
        name: "Safety Helmets",
        slug: "safety-helmets",
        description:
          "Protective headgear for construction and industrial workers",
        sortOrder: 1,
      },
      {
        name: "Safety Gloves",
        slug: "safety-gloves",
        description: "Hand protection for various work environments",
        sortOrder: 2,
      },
      {
        name: "Safety Shoes",
        slug: "safety-shoes",
        description: "Protective footwear with steel toes and slip resistance",
        sortOrder: 3,
      },
      {
        name: "Safety Glasses",
        slug: "safety-glasses",
        description: "Eye protection for industrial and construction work",
        sortOrder: 4,
      },
      {
        name: "Respiratory Protection",
        slug: "respiratory-protection",
        description: "Masks and respirators for air quality protection",
        sortOrder: 5,
      },
      {
        name: "Fall Protection",
        slug: "fall-protection",
        description:
          "Harnesses, lanyards, and safety equipment for height work",
        sortOrder: 6,
      },
    ];

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert new categories
    await Category.insertMany(categories);
    console.log("✅ Categories seeded successfully!");

    console.log("\nCreated categories:");
    categories.forEach((cat) => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
