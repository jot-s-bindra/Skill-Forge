import { connectToDatabase } from "@/lib/mongodb";
import Hackathon from "@/models/Hackathon";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "mytempkey";

export async function POST(req) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.uid; // ✅ authenticated user UID

    const { hackathonId, partnerUid } = await req.json();
    if (uid === partnerUid) {
      return new Response(JSON.stringify({ message: "You cannot apply with yourself!" }), { status: 400 });
    }

    await connectToDatabase();
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return new Response(JSON.stringify({ message: "Hackathon not found" }), { status: 404 });

    // Prevent duplicate application
    const alreadyApplied = hackathon.applicants.some(app => app.uid === uid);
    if (alreadyApplied) {
      return new Response(JSON.stringify({ message: "You have already applied!" }), { status: 400 });
    }

    hackathon.applicants.push({ uid, partner_uid: partnerUid });
    await hackathon.save();

    return new Response(JSON.stringify({ message: "Applied successfully!" }), { status: 200 });
  } catch (err) {
    console.error("❌ Hackathon apply error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
