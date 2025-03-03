import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const newUser = new User({
      uid: "IEC2022077",
      password: "testpassword",
      batch: "2025",
      semesters: [{ semester: 1, courses: [] }], 
      codeforces_id: null,
      preferred_techstacks: ["React", "Node.js"],
    });

    await newUser.save();
    return new Response(JSON.stringify({ message: "Test user created successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    return new Response(JSON.stringify({ message: "Failed to create test user", error: error.message }), { status: 500 });
  }
}
