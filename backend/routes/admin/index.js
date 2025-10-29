// routes/admin/index.js
import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import productRoutes from "./products.js";
import orderRoutes from "./orders.js";
import teamRoutes from "./team.js";
import albumRoutes from "./albums.js";
import branchRoutes from "./branches.js";
import postRoutes from "./posts.js";
import settingsRoutes from "./settings.js";
import notificationRoutes from "./notifications.js";
import contactRoutes from "./contacts.js";

const router = express.Router();
router.use(authenticate);
router.use(authorize("admin"));

router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/team", teamRoutes);
router.use("/albums", albumRoutes);
router.use("/branches", branchRoutes);
router.use("/posts", postRoutes);
router.use("/settings", settingsRoutes);
router.use("/notifications", notificationRoutes);
router.use("/contacts", contactRoutes);

export default router;
