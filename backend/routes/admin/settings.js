// routes/admin/settings.js
import express from "express";
import { setBucket, upload } from "../../middleware/upload.js";
import * as c from "../../controllers/settingsController.js";

const router = express.Router();
router.get("/", c.getOne);
router.put("/", setBucket("settings"), upload.single("hero"), c.update);
export default router;
