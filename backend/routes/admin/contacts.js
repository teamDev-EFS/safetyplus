import express from "express";
import Contact from "../../models/Contact.js";
import { asyncH, created, badRequest } from "../../controllers/_helpers.js";

const router = express.Router();

// Get all contacts
router.get(
  "/",
  asyncH(async (req, res) => {
    const { page = 1, limit = 50, sort = "-createdAt" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const contacts = await Contact.find()
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Contact.countDocuments();

    res.json({
      contacts,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    });
  })
);

// Get contact by ID
router.get(
  "/:id",
  asyncH(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  })
);

// Delete contact
router.delete(
  "/:id",
  asyncH(async (req, res) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  })
);

// Mark contact as read/responded
router.patch(
  "/:id/status",
  asyncH(async (req, res) => {
    const { status } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.status = status;
    await contact.save();

    res.json(contact);
  })
);

export default router;
