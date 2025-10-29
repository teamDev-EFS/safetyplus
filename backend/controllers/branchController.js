// controllers/admin/branchController.js
import Branch from "../models/Branch.js";
import { asyncH, ok, created } from "./_helpers.js";

export const list = asyncH(async (_req, res) => {
  const items = await Branch.find().sort({ city: 1 });
  ok(res, items);
});

export const create = asyncH(async (req, res) => {
  const doc = await Branch.create(req.body);
  created(res, doc);
});

export const update = asyncH(async (req, res) => {
  const doc = await Branch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!doc) return res.status(404).json({ message: "Branch not found" });
  ok(res, doc);
});

export const remove = asyncH(async (req, res) => {
  const doc = await Branch.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: "Branch not found" });
  ok(res, { message: "Branch deleted" });
});
