import mongoose from "mongoose";

const albumImageSchema = new mongoose.Schema({
  path: String,
  alt: String,
  width: Number,
  height: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple documents with null/empty slug
  },
  eventDate: Date,
  coverPath: String,
  images: [albumImageSchema],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate slug from title before saving
albumSchema.pre("save", async function (next) {
  if (
    (this.isModified("title") || !this.slug || this.slug === "") &&
    this.title
  ) {
    let slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim("-"); // Remove leading/trailing hyphens

    // Ensure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (
      await this.constructor.findOne({
        slug: finalSlug,
        _id: { $ne: this._id },
      })
    ) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    this.slug = finalSlug;
  }
  next();
});

albumSchema.index({ isActive: 1, createdAt: -1 });
albumSchema.index({ albumId: 1 });

export default mongoose.model("Album", albumSchema);
