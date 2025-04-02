import { connectToDatabase } from "@/lib/mongodb";
import Hackathon from "@/models/Hackathon";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "mytempkey";

export async function GET() {
  try {
    await connectToDatabase();
    const hackathons = await Hackathon.find();
    return Response.json({ hackathons });
  } catch (error) {
    console.error("❌ Error fetching hackathons:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch hackathons" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { title, description, required_techstacks } = await req.json();

    if (!title || !description || !required_techstacks) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 });
    }

    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized: No token provided" }), { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const createdBy = decoded.uid;

    await connectToDatabase();

    const newHackathon = await Hackathon.create({
      title,
      description,
      required_techstacks,
      createdBy,
      applicants: [],
      final_allocation: [],
    });

    return new Response(JSON.stringify({ hackathon: newHackathon }), { status: 201 });
  } catch (error) {
    console.error("❌ Error creating hackathon:", error);
    return new Response(JSON.stringify({ message: "Failed to create hackathon" }), { status: 500 });
  }
}
