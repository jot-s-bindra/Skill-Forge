import { connectToDatabase } from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(req) {
  console.log("📩 [DEBUG] Incoming POST request to /api/projects/approve");

  try {
    const body = await req.json();
    console.log("✅ [DEBUG] Parsed JSON body:", body);

    const { projectId, studentUid, approve } = body;
    if (!projectId || !studentUid) {
      console.log("❌ [DEBUG] Missing projectId or studentUid");
      return new Response(JSON.stringify({ message: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await connectToDatabase();
    console.log("✅ [DEBUG] Connected to MongoDB");

    const project = await Project.findById(projectId);
    if (!project) {
      console.log("❌ [DEBUG] Project not found:", projectId);
      return new Response(JSON.stringify({ message: "Project not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const applicant = project.applicants.find((app) => app.uid === studentUid);
    if (!applicant) {
      console.log("❌ [DEBUG] Applicant not found:", studentUid);
      return new Response(JSON.stringify({ message: "Applicant not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (approve) {
      console.log("✅ [DEBUG] Approving applicant:", studentUid);
      project.final_allocation.push({ uid: studentUid });
    } else {
      console.log("✅ [DEBUG] Rejecting applicant:", studentUid);
    }

    project.applicants = project.applicants.filter((app) => app.uid !== studentUid);
    await project.save();
    console.log("✅ [DEBUG] Project updated and saved");

    return new Response(JSON.stringify({ message: approve ? "Application approved" : "Application rejected" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ [DEBUG] Server error in /api/projects/approve:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
