// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
      index: true,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Compound index for role + isActive (keeps your intent)
UserSchema.index({ role: 1, isActive: 1 });

// Hash password if needed before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  // Avoid double-hashing if a hash is already present
  const looksHashed =
    typeof this.passwordHash === "string" &&
    (this.passwordHash.startsWith("$2a$") ||
      this.passwordHash.startsWith("$2b$"));

  if (!looksHashed) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Generate password reset token
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Clear password reset token
UserSchema.methods.clearPasswordResetToken = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

export default mongoose.model("User", UserSchema);
