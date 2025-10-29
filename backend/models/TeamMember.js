import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  bioHtml: String,
  email: String,
  phone: String,
  photoPath: String,
  dept: String,
  socials: {
    linkedin: String,
  },
  priority: {
    type: Number,
    default: 0,
  },
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

teamMemberSchema.index({ isActive: 1, priority: 1 });

export default mongoose.model("TeamMember", teamMemberSchema);
