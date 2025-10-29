// routes/admin/posts.js
import express from "express";
import { setBucket, upload } from "../../middleware/upload.js";
import * as c from "../../controllers/postController.js";

const router = express.Router();
router.get("/", c.list);
router.post("/", setBucket("posts"), upload.single("cover"), c.create);
router.put("/:id", setBucket("posts"), upload.single("cover"), c.update);
router.delete("/:id", c.remove);
export default router;
