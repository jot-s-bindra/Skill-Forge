import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Will be hashed later
  batch: { type: String, required: true },
  semesters: { type: Array, default: [] },
  codeforces_id: { type: String, default: null },
  preferred_techstacks: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
