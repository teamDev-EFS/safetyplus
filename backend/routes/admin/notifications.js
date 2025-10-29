import express from "express";
import Notification from "../../models/Notification.js";
import { asyncH, created, badRequest } from "../../controllers/_helpers.js";

const router = express.Router();

// Get all notifications
router.get(
  "/",
  asyncH(async (req, res) => {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  })
);

// Get unread notification count
router.get(
  "/unread-count",
  asyncH(async (req, res) => {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ count });
  })
);

// Mark notification as read
router.patch(
  "/:id/read",
  asyncH(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  })
);

// Mark all notifications as read
router.patch(
  "/mark-all-read",
  asyncH(async (req, res) => {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: "All notifications marked as read" });
  })
);

// Delete notification
router.delete(
  "/:id",
  asyncH(async (req, res) => {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  })
);

export default router;
