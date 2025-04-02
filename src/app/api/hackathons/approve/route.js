import { connectToDatabase } from "@/lib/mongodb";
import Hackathon from "@/models/Hackathon";

export async function POST(req) {
  try {
    const { hackathonId, uid, partner_uid, approve } = await req.json();

    if (!hackathonId || !uid || !partner_uid) {
      return new Response(JSON.stringify({ message: "Missing fields" }), { status: 400 });
    }

    await connectToDatabase();
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return new Response(JSON.stringify({ message: "Hackathon not found" }), { status: 404 });
    }

    hackathon.applicants = hackathon.applicants.filter(app => app.uid !== uid);

    if (approve) {
      const alreadyAllocated = hackathon.final_allocation.some(
        (entry) => entry.uid === uid || entry.uid === partner_uid
      );

      if (alreadyAllocated) {
        return new Response(JSON.stringify({ message: "User(s) already allocated" }), { status: 400 });
      }

      hackathon.final_allocation.push({ uid }, { uid: partner_uid });
    }

    await hackathon.save();

    return new Response(
      JSON.stringify({
        message: approve ? "Application approved" : "Application rejected",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error approving hackathon:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error", error: error.message }),
      { status: 500 }
    );
  }
}
