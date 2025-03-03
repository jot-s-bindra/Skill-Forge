import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectToDatabase();
    const User = db.model("User", new db.Schema({ uid: String, name: String }, { collection: "users" }));

    // Insert test data
    const testUser = new User({ uid: "test123", name: "Test User" });
    await testUser.save();

    return new Response(JSON.stringify({ message: "Test user inserted successfully" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error inserting test user:", error);
    return new Response(JSON.stringify({ message: "Failed to insert test user", error: error.message }), { status: 500 });
  }
}
