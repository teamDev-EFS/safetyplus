// controllers/admin/settingsController.js
import Settings from "../models/Settings.js";
import { asyncH, ok } from "./_helpers.js";

export const getOne = asyncH(async (_req, res) => {
  let doc = await Settings.findOne();
  if (!doc) doc = await Settings.create({});
  ok(res, doc);
});

export const update = asyncH(async (req, res) => {
  let doc = await Settings.findOne();
  if (!doc) doc = await Settings.create({});
  const data = req.body;
  if (req.file)
    data.heroBannerPath = `/${req.uploadBucket}/${req.file.filename}`.replace(
      "uploads/",
      "uploads/"
    );
  Object.assign(doc, data, { updatedAt: new Date() });
  await doc.save();
  ok(res, doc);
});
