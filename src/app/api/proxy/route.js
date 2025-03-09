export async function POST(req) {
    try {
      const { uid, project_id } = await req.json();
  
      console.log("🔄 Sending request to AI service:", { uid, project_id });
  
      const response = await fetch("http://127.0.0.1:5001/api/recommend-partner", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, project_id }),
    });
    
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ AI Service Error:", errorData);
        return new Response(JSON.stringify({ error: "AI Service failed", details: errorData }), {
          status: response.status,
        });
      }
  
      const data = await response.json();
      console.log("✅ AI Service Response:", data);
      return new Response(JSON.stringify(data), { status: 200 });
  
    } catch (error) {
      console.error("❌ Proxy API Error:", error);
      return new Response(JSON.stringify({ error: "Failed to connect to AI service" }), { status: 500 });
    }
  }
  