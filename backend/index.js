import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import orderRoutes from "./routes/orders.js";
import contactRoutes from "./routes/contact.js";
import teamRoutes from "./routes/team.js";
import albumRoutes from "./routes/albums.js";
import blogRoutes from "./routes/blog.js";
import branchRoutes from "./routes/branches.js";
import aiRoutes from "./routes/ai.js";
import settingsRoutes from "./routes/settings.js";
import categoryRoutes from "./routes/categories.js";
import documentsRoutes from "./routes/documents.js";
import adminRoutes from "./routes/admin/index.js";
import metaRoutes from "./routes/meta.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const httpServer = createServer(app);
// Build allowed origins from env (supports comma-separated lists) and sensible defaults
const envOrigins = [
  process.env.FRONTEND_URL,
  process.env.PUBLIC_WEB_URL,
  process.env.FRONTEND_URLS,
  process.env.PUBLIC_WEB_URLS,
  process.env.CORS_ALLOWED_ORIGINS,
]
  .filter(Boolean)
  .flatMap((value) => value.split(",").map((v) => v.trim()))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  // Netlify preview/main sites
  "https://safetyplusco.netlify.app",
  "https://safetyplus.netlify.app",
  // Primary domains
  "https://www.safetyplus.co.in",
  "https://safetyplus.co.in",
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// CORS configuration - allowlist for production

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve static files from a configurable uploads directory
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "uploads");
app.use("/uploads", express.static(UPLOADS_DIR));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/safetyplus"
    );
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

connectDB();

// Socket.IO setup
const socketIo = (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (data) => {
    if (data.role === "admin") {
      socket.join("admin");
      console.log("Admin joined");
    } else if (data.userId) {
      socket.join(`user:${data.userId}`);
      console.log(`User ${data.userId} joined`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
};

io.on("connection", socketIo);

// Make io available to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meta", metaRoutes);

// Health check endpoints (Render requires /healthz)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
