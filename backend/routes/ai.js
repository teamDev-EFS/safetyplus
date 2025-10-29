import express from "express";
import { aiLimiter } from "../middleware/rateLimiter.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Settings from "../models/Settings.js";

const router = express.Router();

// AI Assistant endpoint
router.post("/respond", aiLimiter, async (req, res) => {
  try {
    const { messages, context } = req.body;
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content.toLowerCase();

    // Simple intent detection
    let response = { text: "", actions: [] };

    if (
      userQuery.includes("find") ||
      userQuery.includes("search") ||
      userQuery.includes("show")
    ) {
      // Search products intent
      const query = extractSearchQuery(userQuery);
      const filters = extractFilters(userQuery);

      const products = await Product.find({
        $text: { $search: query },
        isActive: true,
        ...filters,
      })
        .limit(5)
        .populate("categoryId", "name")
        .populate("brandId", "name");

      response.text = `I found ${products.length} products:`;
      response.actions = products.map((product) => ({
        type: "openProduct",
        payload: { slug: product.slug, name: product.name },
      }));

      response.text +=
        "\n\n" +
        products
          .map((p, i) => `${i + 1}. ${p.name} - ₹${p.priceSell}`)
          .join("\n");
    } else if (
      userQuery.includes("track") ||
      userQuery.includes("order") ||
      userQuery.includes("status")
    ) {
      // Track order intent
      const orderNo = extractOrderNumber(userQuery);
      const email = extractEmail(userQuery);

      if (orderNo) {
        const order = await Order.findOne({ orderNo });

        if (order) {
          if (
            order.guestInfo &&
            order.guestInfo.email.toLowerCase() === email?.toLowerCase()
          ) {
            response.text = `Order ${orderNo} is currently: **${order.status}**\n\nStatus History:`;
            order.statusHistory.forEach((hist) => {
              response.text += `\n${hist.at}: ${hist.status}${
                hist.note ? " - " + hist.note : ""
              }`;
            });
            response.actions.push({
              type: "openOrder",
              payload: { orderNo },
            });
          } else {
            response.text = "Could not verify order credentials.";
          }
        } else {
          response.text = `Order ${orderNo} not found.`;
        }
      } else {
        response.text = "Please provide an order number to track your order.";
      }
    } else if (
      userQuery.includes("schedule") ||
      userQuery.includes("demo") ||
      userQuery.includes("meeting") ||
      userQuery.includes("book")
    ) {
      // Schedule meeting intent
      const settings = await Settings.findOne();
      const calendlyUrl = settings?.calendlyUrl || process.env.CALENDLY_URL;

      if (calendlyUrl) {
        response.text = "Click below to schedule a meeting with our team:";
        response.actions.push({
          type: "openUrl",
          payload: { url: calendlyUrl, label: "Schedule Meeting on Calendly" },
        });
      } else {
        response.text = "Meeting scheduling is not available at the moment.";
      }
    } else {
      // Default response
      response.text =
        "I can help you with:\n• Finding products\n• Tracking orders\n• Scheduling meetings\n\nHow may I assist you today?";
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function extractSearchQuery(query) {
  const afterKeywords = query
    .replace(/find|search|show/i, "")
    .replace(/under|below/i, "")
    .replace(/\d+/g, "")
    .trim();

  return afterKeywords || "safety equipment";
}

function extractFilters(query) {
  const filters = {};
  const priceMatch = query.match(/under|below|less.*?(\d+)/i);
  if (priceMatch) {
    filters.priceSell = { $lte: parseInt(priceMatch[1]) * 1000 };
  }
  return filters;
}

function extractOrderNumber(query) {
  const match = query.match(/(?:order|#)\s*([A-Z0-9-]+)/i);
  return match ? match[1] : null;
}

function extractEmail(query) {
  const match = query.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
  return match ? match[1] : null;
}

export default router;
