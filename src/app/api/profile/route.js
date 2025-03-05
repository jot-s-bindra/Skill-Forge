import { connectToDatabase } from "@/lib/mongodb";
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
    const { codeforcesId, techStacks } = await req.json();

    if (!codeforcesId || techStacks.length === 0) {
      return new Response(JSON.stringify({ message: "Codeforces ID and Tech Stacks are required" }), { status: 400 });
    }

    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate(
      { uid: decoded.uid },
      { $set: { codeforces_id: codeforcesId, preferred_techstacks: techStacks } },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Profile updated successfully" }), { status: 200 });

  } catch (error) {
    console.error("❌ Error in /api/profile:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
