import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  required_techstacks: { type: [String], required: true },
  applicants: [{ uid: { type: String, ref: "User" }, team_members: [String] }],
  createdBy: { type: String, ref: "User", required: true }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
