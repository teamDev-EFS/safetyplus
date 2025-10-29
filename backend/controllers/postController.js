// controllers/admin/postController.js
import Post from "../models/Post.js";
import { asyncH, ok, created } from "./_helpers.js";

export const list = asyncH(async (_req, res) => {
  const items = await Post.find().sort({ createdAt: -1 });
  ok(res, items);
});

export const create = asyncH(async (req, res) => {
  const data = req.body;
  if (req.file)
    data.coverPath = `/${req.uploadBucket}/${req.file.filename}`.replace(
      "uploads/",
      "uploads/"
    );
  const post = await Post.create(data);
  created(res, post);
});

export const update = asyncH(async (req, res) => {
  const data = req.body;
  if (req.file)
    data.coverPath = `/${req.uploadBucket}/${req.file.filename}`.replace(
      "uploads/",
      "uploads/"
    );
  data.updatedAt = new Date();
  const post = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!post) return res.status(404).json({ message: "Post not found" });
  ok(res, post);
});

export const remove = asyncH(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  ok(res, { message: "Post deleted" });
});
