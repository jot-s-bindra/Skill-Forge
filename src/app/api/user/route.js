import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "mytempkey";

export async function GET(req) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return new Response(JSON.stringify({ 
      uid: decoded.uid, 
      role: decoded.role
    }), { status: 200 });

  } catch (error) {
    console.error("❌ Error in /api/user:", error);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), { status: 500 });
  }
}
