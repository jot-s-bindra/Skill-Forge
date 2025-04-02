import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  required_techstacks: { type: [String], required: true },
  createdBy: { type: String, ref: "User", required: true },
  applicants: [
    {
      uid: { type: String, ref: "User" },
      partner_uid: { type: String, ref: "User" },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    },
  ],
  final_allocation: [
    {
      uid: { type: String, ref: "User" },
      partner_uid: { type: String, ref: "User" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema);
