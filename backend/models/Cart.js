import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: String,
  name: String,
  price: Number,
  qty: Number,
  imagePath: String,
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [cartItemSchema],
  totals: {
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    grand: { type: Number, default: 0 },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Cart", cartSchema);
