// routes/admin/team.js
import express from "express";
import { setBucket, upload } from "../../middleware/upload.js";
import * as c from "../../controllers/teamController.js";

const router = express.Router();
router.get("/", c.list);
router.post("/", setBucket("team"), upload.single("photo"), c.create);
router.put("/:id", setBucket("team"), upload.single("photo"), c.update);
router.delete("/:id", c.remove);
export default router;
