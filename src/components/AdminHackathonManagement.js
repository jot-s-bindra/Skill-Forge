"use client";
import { useEffect, useState } from "react";

export default function AdminHackathonsManagement() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hackathons");
      const data = await res.json();
      if (res.ok) {
        setHackathons(data.hackathons);
      } else {
        setError(data.message || "Failed to fetch hackathons");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  const handleDecision = async (hackathonId, uid, partner_uid, approve = true) => {
    const hackathon = hackathons.find(h => h._id === hackathonId);
    const allFinalized = hackathon.final_allocation.map(pair => [pair.uid, pair.partner_uid]).flat();
    const allPending = hackathon.applicants.map(pair => [pair.uid, pair.partner_uid]).flat();
  
    // Disallow duplicate approval
    if (approve && (allFinalized.includes(uid) || allFinalized.includes(partner_uid))) {
      alert("One of the students is already approved for this hackathon.");
      return;
    }
  
    if (approve && (
      hackathon.applicants.filter(app => 
        (app.uid === uid || app.partner_uid === uid || 
         app.uid === partner_uid || app.partner_uid === partner_uid)
      ).length > 1)) {
      alert("Can't approve multiple pending requests involving the same user.");
      return;
    }
  
    try {
      const res = await fetch("/api/hackathons/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathonId, uid, partner_uid, approve }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert(approve ? "Approved!" : "Rejected!");
        fetchHackathons(); 
      } else {
        setError(data.message || "Error updating application");
      }
    } catch (err) {
      console.error("❌ Decision Error:", err);
      setError("Something went wrong.");
    }
  };
  

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Manage Hackathon Applications</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {hackathons
        .filter((h) => h.applicants.length > 0)
        .map((hack) => (
          <div key={hack._id} className="bg-white p-4 rounded shadow mb-4">
            <h3 className="font-bold">{hack.title}</h3>
            <p>{hack.description}</p>
            <p className="text-sm text-gray-500">Tech: {hack.required_techstacks.join(", ")}</p>

            <div className="mt-3">
              {hack.applicants.map((app) => (
                <div
                  key={app.uid}
                  className="flex justify-between items-center border p-2 rounded mt-2"
                >
                  <div>
                    <p className="text-sm">
                      <strong>UID:</strong> {app.uid}
                    </p>
                    <p className="text-sm">
                      <strong>Partner:</strong> {app.partner_uid}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() => handleDecision(hack._id, app.uid, app.partner_uid, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleDecision(hack._id, app.uid, app.partner_uid, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
