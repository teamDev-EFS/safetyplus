// controllers/admin/albumController.js
import Album from "../models/Album.js";
import { asyncH, ok, created } from "./_helpers.js";

export const list = asyncH(async (_req, res) => {
  const items = await Album.find().sort({ createdAt: -1 });
  ok(res, items);
});

export const create = asyncH(async (req, res) => {
  const data = req.body;
  if (req.file) data.coverPath = `/${req.bucket}/${req.file.filename}`;
  const doc = await Album.create(data);
  created(res, doc);
});

export const update = asyncH(async (req, res) => {
  const data = req.body;

  // Handle existing images - if existingImages is provided, use it as the new coverPath
  if (data.existingImages) {
    try {
      const existingImages = JSON.parse(data.existingImages);
      if (existingImages.length > 0) {
        // Extract the path from the existing image URL
        const imageUrl = existingImages[0].url;
        const pathMatch = imageUrl.match(/\/uploads\/[^/]+\/[^/]+$/);
        if (pathMatch) {
          data.coverPath = pathMatch[0];
        }
      } else {
        data.coverPath = null; // No existing images, remove cover
      }
    } catch (err) {
      console.error("Error parsing existingImages:", err);
    }
    delete data.existingImages; // Remove from data before saving
  }

  // Handle new file upload
  if (req.file) {
    data.coverPath = `/${req.bucket}/${req.file.filename}`;
  }

  const doc = await Album.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!doc) return res.status(404).json({ message: "Album not found" });
  ok(res, doc);
});

export const remove = asyncH(async (req, res) => {
  const doc = await Album.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Album not found" });
  ok(res, { message: "Album deleted" });
});
