// routes/admin/branches.js
import express from "express";
import * as c from "../../controllers/branchController.js";
const router = express.Router();
router.get("/", c.list);
router.post("/", c.create);
router.put("/:id", c.update);
router.delete("/:id", c.remove);
export default router;
