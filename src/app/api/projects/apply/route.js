import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "mytempkey";

export async function POST(req) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "student") {
      return new Response(JSON.stringify({ message: "Only students can apply" }), { status: 403 });
    }

    const { projectId, partnerUid } = await req.json();
    if (!projectId || !partnerUid) {
      return new Response(JSON.stringify({ message: "Project ID and partner UID are required" }), { status: 400 });
    }

    await connectToDatabase();
    const project = await Project.findById(projectId);

    if (!project) {
      return new Response(JSON.stringify({ message: "Project not found" }), { status: 404 });
    }

    const alreadyApplied = (project.applicants || []).some((app) => app.uid === decoded.uid);
    if (alreadyApplied) {
      return new Response(JSON.stringify({ message: "You have already applied for this project" }), { status: 400 });
    }

    project.applicants.push({
      uid: decoded.uid,
      partner_uid: partnerUid,
      status: "pending",
    });

    await project.save();

    return new Response(JSON.stringify({ message: "Application submitted successfully" }), { status: 201 });

  } catch (error) {
    console.error("❌ Error in /api/projects/apply:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
