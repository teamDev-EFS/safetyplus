// controllers/admin/teamController.js
import TeamMember from "../models/TeamMember.js";
import { asyncH, ok, created } from "./_helpers.js";

export const list = asyncH(async (_req, res) => {
  const items = await TeamMember.find().sort({ priority: 1, name: 1 });
  ok(res, items);
});

export const create = asyncH(async (req, res) => {
  const data = req.body;
  if (req.file) data.photoPath = `/${req.bucket}/${req.file.filename}`;
  const doc = await TeamMember.create(data);
  created(res, doc);
});

export const update = asyncH(async (req, res) => {
  const data = req.body;
  if (req.file) data.photoPath = `/${req.bucket}/${req.file.filename}`;
  data.updatedAt = new Date();
  const doc = await TeamMember.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });
  if (!doc) return res.status(404).json({ message: "Member not found" });
  ok(res, doc);
});

export const remove = asyncH(async (req, res) => {
  const doc = await TeamMember.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Member not found" });
  ok(res, { message: "Member deleted" });
});
