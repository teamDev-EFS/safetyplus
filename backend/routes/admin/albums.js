// routes/admin/albums.js
import express from "express";
import { setBucket, upload } from "../../middleware/upload.js";
import * as c from "../../controllers/albumController.js";

const router = express.Router();
router.get("/", c.list);
router.post("/", setBucket("gallery/albums"), upload.single("cover"), c.create);
router.put(
  "/:id",
  setBucket("gallery/albums"),
  upload.single("cover"),
  c.update
);
router.delete("/:id", c.remove);
export default router;
