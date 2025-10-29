import mongoose from "mongoose";

const orderAddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
});

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  sku: String,
  name: String,
  price: Number,
  qty: Number,
  imagePath: String,
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ],
  },
  note: String,
  at: Date,
});

const orderSchema = new mongoose.Schema({
  orderNo: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  items: [orderItemSchema],
  totals: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    grand: Number,
  },
  paymentMethod: {
    type: String,
    enum: ["PO", "COD", "Offline"],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  status: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "placed",
  },
  statusHistory: [statusHistorySchema],
  shippingAddress: orderAddressSchema,
  billingAddress: orderAddressSchema,
  trackingCourier: String,
  trackingNo: String,
  trackingEta: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ orderNo: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model("Order", orderSchema);
