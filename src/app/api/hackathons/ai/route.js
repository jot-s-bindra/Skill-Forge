export async function POST(req) {
    try {
      const { uid, hackathon_id } = await req.json();
  
      const response = await fetch("http://127.0.0.1:5001/api/recommend-hackathon-partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, hackathon_id }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        return new Response(JSON.stringify({ error: errorData.error || "AI service failed" }), {
          status: response.status,
        });
      }
  
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to connect to AI service" }), { status: 500 });
    }
  }
  