"use client";
import { useState } from "react";

export default function StudentHackathons({ hackathons, userUid, setHackathons }) {
  const [partnerUids, setPartnerUids] = useState({});
  const [loadingHackathon, setLoadingHackathon] = useState(null);
  const [aiLoadingHackathon, setAiLoadingHackathon] = useState(null);
  const [aiRecommendedPartners, setAiRecommendedPartners] = useState({});
  const [appliedHackathons, setAppliedHackathons] = useState(new Set());
  const [error, setError] = useState("");

  const findAiPartner = async (hackathonId) => {
    if (appliedHackathons.has(hackathonId)) return;

    setAiLoadingHackathon(hackathonId);
    setError("");
    setAiRecommendedPartners((prev) => ({ ...prev, [hackathonId]: null }));

    try {
      const response = await fetch("/api/hackathons/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userUid, hackathon_id: hackathonId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI service failed");

      setAiRecommendedPartners((prev) => ({
        ...prev,
        [hackathonId]: data.recommended_partner || null,
      }));
    } catch (err) {
      console.error("AI Error:", err);
      setError("AI Partner Finder failed.");
    }

    setAiLoadingHackathon(null);
  };

  const handleApply = async (hackathonId, partnerUid) => {
    if (!partnerUid) return alert("Please enter or confirm a partner.");

    setLoadingHackathon(hackathonId);
    setError("");

    try {
      const response = await fetch("/api/hackathons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathonId, partnerUid }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application failed");

      alert("Applied successfully!");
      setAppliedHackathons((prev) => new Set([...prev, hackathonId]));
      setPartnerUids((prev) => ({ ...prev, [hackathonId]: "" }));

      setHackathons((prev) =>
        prev.map((h) =>
          h._id === hackathonId
            ? { ...h, applicants: [...(h.applicants || []), { uid: userUid, partner_uid: partnerUid }] }
            : h
        )
      );
    } catch (err) {
      console.error("Apply Error:", err);
      setError(err.message);
    }

    setLoadingHackathon(null);
  };
  const visibleHackathons = hackathons.filter(h => (h.final_allocation || []).length === 0);
  return (
    <div className="mt-6">
{visibleHackathons.length === 0 ? (
  <p>No hackathons available.</p>
) : (
  visibleHackathons.map((hackathon) => {
    const alreadyApplied =
    appliedHackathons.has(hackathon._id) ||
    hackathon.applicants?.some(
      (a) => a.uid === userUid || a.partner_uid === userUid
    );
  

          return (
            <div key={hackathon._id} className="bg-white p-4 rounded shadow mt-4">
              <h3 className="font-bold">{hackathon.title}</h3>
              <p>{hackathon.description}</p>
              <p className="text-sm text-gray-600">
                <strong>Required Tech:</strong> {hackathon.required_techstacks?.join(", ")}
              </p>

              {!alreadyApplied ? (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter Partner UID"
                    value={partnerUids[hackathon._id] || ""}
                    onChange={(e) =>
                      setPartnerUids((prev) => ({ ...prev, [hackathon._id]: e.target.value }))
                    }
                    className="w-full p-2 border rounded mb-2"
                    required
                  />

                  <button
                    onClick={() => findAiPartner(hackathon._id)}
                    className={`w-full p-2 mb-2 rounded ${
                      aiLoadingHackathon === hackathon._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-600 text-white"
                    }`}
                    disabled={aiLoadingHackathon === hackathon._id}
                  >
                    {aiLoadingHackathon === hackathon._id ? "Finding Partner..." : "AI Partner Finder"}
                  </button>

                  {aiRecommendedPartners[hackathon._id] && (
                    <div className="bg-gray-100 p-2 rounded text-sm text-gray-700">
                      <p>
                        AI Recommended Partner:{" "}
                        <strong>{aiRecommendedPartners[hackathon._id]}</strong>
                      </p>
                      <button
                        onClick={() => handleApply(hackathon._id, aiRecommendedPartners[hackathon._id])}
                        className="mt-2 w-full p-2 bg-green-500 text-white rounded"
                      >
                        Apply with {aiRecommendedPartners[hackathon._id]}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleApply(hackathon._id, partnerUids[hackathon._id])}
                    className={`w-full p-2 rounded ${
                      loadingHackathon === hackathon._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white"
                    }`}
                    disabled={loadingHackathon === hackathon._id}
                  >
                    {loadingHackathon === hackathon._id ? "Applying..." : "Apply with Partner"}
                  </button>
                </div>
              ) : (
                <div className="text-sm mt-2 text-center text-gray-600 font-semibold">
                  ✅ Already Applied
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
