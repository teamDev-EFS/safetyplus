import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  addressLines: [String],
  phones: [String],
  emails: [String],
  mapEmbedUrl: String,
  imagePath: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

branchSchema.index({ city: 1, isActive: 1 });

export default mongoose.model("Branch", branchSchema);
