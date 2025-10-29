import express from "express";
import Contact from "../models/Contact.js";
import Notification from "../models/Notification.js";
import { contactLimiter } from "../middleware/rateLimiter.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Create contact message
router.post("/", contactLimiter, async (req, res) => {
  try {
    const { name, company, mobile, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      company,
      mobile,
      email,
      subject,
      message,
    });

    // Send email notification
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.COMPANY_EMAIL || "store@safetyplus.com",
        subject: `New Contact: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Mobile:</strong> ${mobile}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    // Emit to admin
    if (req.app.get("io")) {
      req.app.get("io").to("admin").emit("contact:new", {
        contactId: contact._id,
        name,
        subject,
      });
    }

    // Create notification for admin
    await Notification.create({
      type: "contact_form",
      title: "New Contact Form Submission",
      message: `${name} submitted a contact form: "${subject}"`,
      data: {
        contactId: contact._id,
        name,
        company,
        email,
        mobile,
        subject,
        message:
          message.substring(0, 100) + (message.length > 100 ? "..." : ""),
      },
    });

    // Emit real-time notification to admin
    req.app.get("io")?.emit("admin:notification", {
      type: "contact_form",
      title: "New Contact Form Submission",
      message: `${name} submitted a contact form`,
      contactId: contact._id,
    });

    res.status(201).json({
      message: "Contact message sent successfully",
      id: contact._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
