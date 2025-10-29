import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import TeamMember from "../models/TeamMember.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO = process.env.MONGODB_URI;

async function fixUndefinedPaths() {
  try {
    if (!MONGO) throw new Error("Missing MONGODB_URI in .env");
    await mongoose.connect(MONGO);
    console.log("✓ Connected to MongoDB");

    // Find all team members with /undefined/ in their photoPath
    const membersWithUndefined = await TeamMember.find({
      photoPath: { $regex: "/undefined/" },
    });

    console.log(
      `Found ${membersWithUndefined.length} members with /undefined/ paths`
    );

    for (const member of membersWithUndefined) {
      if (member.photoPath) {
        // Fix the path by replacing /undefined/ with /team/
        const fixedPath = member.photoPath.replace("/undefined/", "/team/");
        await TeamMember.updateOne(
          { _id: member._id },
          { photoPath: fixedPath }
        );
        console.log(
          `✓ Fixed ${member.name}: ${member.photoPath} → ${fixedPath}`
        );
      }
    }

    console.log("\n✓ Successfully fixed all /undefined/ paths");
    process.exit(0);
  } catch (err) {
    console.error("Fix error:", err);
    process.exit(1);
  }
}

fixUndefinedPaths();
