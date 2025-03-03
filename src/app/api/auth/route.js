import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "mytempkey"; 

export async function POST(req) {
  try {
    const { uid, password } = await req.json();

    const flaskResponse = await fetch("http://127.0.0.1:5112/api/student/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, pwd: password, batch: "2025" })
    });

    const flaskData = await flaskResponse.json();

    if (!flaskResponse.ok || !flaskData.data.semesters || flaskData.data.semesters.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid ERP credentials" }), { status: 401 });
    }

    const { semesters } = flaskData.data;

    await connectToDatabase();

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        password, 
        batch: "2025",
        semesters,
      });

      await user.save();
      console.log("✅ New user stored in MongoDB:", user);
    }

    const token = jwt.sign({ uid }, JWT_SECRET, { expiresIn: "7d" });

    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
    });

    return new Response(JSON.stringify({ message: "Login successful", newUser: !user.codeforces_id }), {
      status: 200,
      headers: { "Set-Cookie": cookie },
    });

  } catch (error) {
    console.error("❌ Error in /api/auth:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
