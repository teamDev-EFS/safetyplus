import rateLimit from "express-rate-limit";

export const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: "Too many contact requests, please try again later.",
});

export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, please try again later.",
});

// Login-specific limiter: 10 attempts per minute per IP
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    // Render forwards X-Forwarded-For; trust proxy set in index.js, also relax strict validation
    xForwardedForHeader: false,
  },
  message: {
    success: false,
    message:
      "Too many login attempts from this IP. Please wait 1 minute and try again.",
  },
});
