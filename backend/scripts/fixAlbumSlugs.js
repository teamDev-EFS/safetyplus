import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Album from "../models/Album.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO = process.env.MONGODB_URI;

async function fixAlbumSlugs() {
  try {
    if (!MONGO) throw new Error("Missing MONGODB_URI in .env");
    await mongoose.connect(MONGO);
    console.log("✓ Connected to MongoDB");

    // Find all albums with empty or missing slugs
    const albumsToFix = await Album.find({
      $or: [{ slug: "" }, { slug: null }, { slug: { $exists: false } }],
    });

    console.log(`Found ${albumsToFix.length} albums with empty/missing slugs`);

    for (const album of albumsToFix) {
      if (album.title) {
        // Generate slug from title
        const slug = album.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
          .trim("-"); // Remove leading/trailing hyphens

        // Ensure slug is unique
        let finalSlug = slug;
        let counter = 1;
        while (
          await Album.findOne({ slug: finalSlug, _id: { $ne: album._id } })
        ) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        await Album.updateOne({ _id: album._id }, { slug: finalSlug });
        console.log(`✓ Fixed ${album.title}: '' → '${finalSlug}'`);
      } else {
        console.log(`⚠ Skipping album without title: ${album._id}`);
      }
    }

    console.log("\n✓ Successfully fixed all album slugs");
    process.exit(0);
  } catch (err) {
    console.error("Fix error:", err);
    process.exit(1);
  }
}

fixAlbumSlugs();
