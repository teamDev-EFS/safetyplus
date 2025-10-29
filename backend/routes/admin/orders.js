import express from "express";
import Order from "../../models/Order.js";

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put("/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.statusHistory.push({ status, note, at: new Date() });
    order.updatedAt = new Date();

    await order.save();

    // Emit to user if they're connected
    if (order.userId) {
      req.app.get("io")?.to(`user:${order.userId}`).emit("order:status", {
        orderNo: order.orderNo,
        status,
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
