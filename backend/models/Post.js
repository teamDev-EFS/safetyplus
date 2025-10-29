import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  contentHtml: String,
  coverPath: String,
  excerpt: String,
  tags: [String],
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ isPublished: 1, tags: 1 });
postSchema.index({ title: "text", contentHtml: "text" });

export default mongoose.model("Post", postSchema);
