import express from "express";
import Order from "../models/Order.js";
import Notification from "../models/Notification.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";
import { asyncH, created, badRequest } from "../controllers/_helpers.js";

const router = express.Router();

// Create order
router.post(
  "/",
  optionalAuthenticate,
  asyncH(async (req, res) => {
    const {
      orderNo,
      items,
      totals,
      paymentMethod,
      shippingAddress,
      billingAddress,
      guestInfo,
    } = req.body;

    // Validation
    if (!orderNo || !items || !items.length || !totals || !paymentMethod) {
      return badRequest(res, "Missing required fields");
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return badRequest(res, "Invalid shipping address");
    }

    if (
      !billingAddress ||
      !billingAddress.name ||
      !billingAddress.addressLine1 ||
      !billingAddress.city ||
      !billingAddress.state ||
      !billingAddress.postalCode
    ) {
      return badRequest(res, "Invalid billing address");
    }

    // Validate totals
    if (
      typeof totals.subtotal !== "number" ||
      typeof totals.tax !== "number" ||
      typeof totals.shipping !== "number" ||
      typeof totals.grand !== "number"
    ) {
      return badRequest(res, "Invalid totals");
    }

    // Validate items
    for (const item of items) {
      if (
        !item.productId ||
        !item.name ||
        typeof item.price !== "number" ||
        typeof item.qty !== "number" ||
        item.qty <= 0
      ) {
        return badRequest(res, "Invalid item data");
      }
    }

    const orderData = {
      orderNo,
      items,
      totals,
      paymentMethod,
      shippingAddress,
      billingAddress,
      status: "placed",
      paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
      statusHistory: [
        {
          status: "placed",
          note: "Order placed",
          at: new Date(),
        },
      ],
    };

    // Add user ID if authenticated
    if (req.user) {
      orderData.userId = req.user._id;
    } else if (guestInfo) {
      orderData.guestInfo = guestInfo;
    } else {
      return badRequest(res, "Authentication or guest info required");
    }

    const order = await Order.create(orderData);

    // Create notification for admin
    await Notification.create({
      type: "order_placed",
      title: "New Order Placed",
      message: `Order ${orderNo} has been placed by ${
        orderData.guestInfo?.name ||
        orderData.shippingAddress?.name ||
        "Customer"
      }`,
      data: {
        orderId: order._id,
        orderNo: orderNo,
        customerName:
          orderData.guestInfo?.name || orderData.shippingAddress?.name,
        customerEmail:
          orderData.guestInfo?.email || orderData.shippingAddress?.email,
        total: orderData.totals.grand,
        paymentMethod: orderData.paymentMethod,
      },
    });

    // Emit real-time notification to admin
    req.app.get("io")?.emit("admin:notification", {
      type: "order_placed",
      title: "New Order Placed",
      message: `Order ${orderNo} has been placed`,
      orderNo: orderNo,
    });

    created(res, order);
  })
);

// Get user orders
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.productId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by order number
router.get("/:orderNo", optionalAuthenticate, async (req, res) => {
  try {
    const { email, phone } = req.query;
    const order = await Order.findOne({ orderNo: req.params.orderNo });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify identity for guest orders
    if (order.guestInfo) {
      if (order.guestInfo.email !== email && order.guestInfo.phone !== phone) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } else if (req.user) {
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    } else {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
