import { Router } from "express";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { upload } from "../../middleware/upload.js";
import Product from "../../models/Product.js";
import {
  adminListProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/products.controller.js";

const router = Router();

router.use(authenticate, requireAdmin);

// list (with q/page/limit)
router.get("/", adminListProducts);

// get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create (multipart form, field: images)
router.post("/", upload.array("images", 8), createProduct);

// update (can append images)
router.put("/:id", upload.array("images", 8), updateProduct);

// delete
router.delete("/:id", deleteProduct);

export default router;
