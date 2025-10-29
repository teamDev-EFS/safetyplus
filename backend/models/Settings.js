// models/Settings.js
import mongoose from "mongoose";

const socialsSchema = new mongoose.Schema({
  facebook: String,
  instagram: String,
  linkedin: String,
  twitter: String,
  youtube: String,
});

const settingsSchema = new mongoose.Schema({
  companyName: { type: String, default: "SafetyPlus" },
  supportEmail: { type: String, default: "support@safetyplus.com" },
  supportPhone: String,
  addressLines: [String],
  gstNo: String,
  socials: socialsSchema,
  heroBannerPath: String,
  theme: {
    primary: { type: String, default: "#059669" }, // emerald-600
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Settings", settingsSchema);
