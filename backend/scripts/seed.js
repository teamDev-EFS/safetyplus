// scripts/seed.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO = process.env.MONGODB_URI;

async function seed() {
  try {
    if (!MONGO) throw new Error("Missing MONGODB_URI in .env");
    await mongoose.connect(MONGO);
    console.log("✓ Connected to MongoDB");

    const email = "admin@safetyplus.com";
    let admin = await User.findOne({ email });

    if (!admin) {
      const passwordHash = await bcrypt.hash("Admin@123", 10);
      admin = await User.create({
        email,
        name: "Admin User",
        phone: "0422 4982221",
        role: "admin",
        isActive: true,
        passwordHash,
      });
      console.log("✓ Admin created");
    } else {
      // ensure admin role & active
      admin.role = "admin";
      admin.isActive = true;
      await admin.save();
      console.log("✓ Admin already exists (ensured role=admin, active)");
    }

    console.log("Admin credentials:");
    console.log(`  Email   : ${email}`);
    console.log(`  Password: Admin@123`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
