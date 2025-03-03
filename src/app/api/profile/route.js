import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Same secret as before

export async function POST(req) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.uid;

    await connectToDatabase();

    let user = await User.findOne({ uid });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const { codeforcesId, techStacks } = await req.json();
    user.codeforces_id = codeforcesId;
    user.preferred_techstacks = techStacks;
    await user.save();

    return new Response(JSON.stringify({ message: "Profile updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error in /api/profile:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
