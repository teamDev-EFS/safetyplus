import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get or create cart
router.get("/", authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          grand: 0,
        },
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post("/add", authenticate, async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [],
        totals: {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          grand: 0,
        },
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({
        productId,
        sku: product.sku,
        name: product.name,
        price: product.priceSell,
        qty,
        imagePath: product.images[0]?.path || "",
      });
    }

    calculateTotals(cart);
    await cart.save();

    // Emit to admin via Socket.IO
    req.app.get("io")?.to("admin").emit("cart:updated", {
      userId: req.user._id,
      itemsCount: cart.items.length,
    });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quantity
router.put("/:productId", authenticate, async (req, res) => {
  try {
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (qty <= 0) {
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== req.params.productId
      );
    } else {
      item.qty = qty;
    }

    calculateTotals(cart);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item
router.delete("/:productId", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    calculateTotals(cart);
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete("/", authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      calculateTotals(cart);
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function calculateTotals(cart) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const tax = subtotal * 0.18;
  const shipping = subtotal > 1000 ? 0 : 50;
  const grand = subtotal + tax + shipping;

  cart.totals = { subtotal, tax, shipping, grand };
  cart.updatedAt = new Date();
}

export default router;
