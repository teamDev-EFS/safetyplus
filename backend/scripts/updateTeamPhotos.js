import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import TeamMember from "../models/TeamMember.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO = process.env.MONGODB_URI;

async function updateTeamPhotos() {
  try {
    if (!MONGO) throw new Error("Missing MONGODB_URI in .env");
    await mongoose.connect(MONGO);
    console.log("✓ Connected to MongoDB");

    // Update team members with photo paths
    const updates = [
      { name: "Rajesh Kumar", photoPath: "/team/ceo-photo.jpg" },
      { name: "Priya Sharma", photoPath: "/team/operations-photo.jpg" },
      { name: "Amit Patel", photoPath: "/team/engineering-photo.jpg" },
      { name: "Sneha Reddy", photoPath: "/team/customer-photo.jpg" },
      { name: "Vikram Singh", photoPath: "/team/sales-photo.jpg" },
      { name: "Anita Desai", photoPath: "/team/quality-photo.jpg" },
    ];

    for (const update of updates) {
      const result = await TeamMember.updateOne(
        { name: update.name },
        { photoPath: update.photoPath }
      );
      console.log(`✓ Updated ${update.name} with photo: ${update.photoPath}`);
    }

    console.log("\n✓ Successfully updated team member photos");
    process.exit(0);
  } catch (err) {
    console.error("Update error:", err);
    process.exit(1);
  }
}

updateTeamPhotos();
