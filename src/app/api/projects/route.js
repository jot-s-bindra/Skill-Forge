import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User"; 
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
    if (decoded.role !== "teacher") {
      return new Response(JSON.stringify({ message: "Only teachers can add projects" }), { status: 403 });
    }

    const { title, description, required_techstacks } = await req.json();
    if (!title || !description || !required_techstacks.length) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    await connectToDatabase();

    const newProject = new Project({
      title,
      description,
      required_techstacks,
      createdBy: decoded.uid, 
    });

    await newProject.save();
    return new Response(JSON.stringify({ message: "Project added successfully" }), { status: 201 });

  } catch (error) {
    console.error("❌ Error in /api/projects:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await Project.find();

    const projectData = await Promise.all(
      projects.map(async (project) => {
        const teacher = await User.findOne({ uid: project.createdBy }); 
        return {
          ...project.toObject(),
          createdByName: teacher ? teacher.uid : "Unknown Teacher", 
        };
      })
    );

    return new Response(JSON.stringify({ projects: projectData }), { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
