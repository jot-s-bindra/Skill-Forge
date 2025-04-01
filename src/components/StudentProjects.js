"use client";
import { useState } from "react";

export default function StudentProjects({ projects, userUid, setProjects }) {
  const [partnerUids, setPartnerUids] = useState({});
  const [loadingProject, setLoadingProject] = useState(null);
  const [error, setError] = useState("");
  const [aiLoadingProject, setAiLoadingProject] = useState(null); 
  const [aiRecommendedPartners, setAiRecommendedPartners] = useState({}); 
  const [appliedProjects, setAppliedProjects] = useState(new Set()); 
  const findAiPartner = async (projectId) => {
    if (appliedProjects.has(projectId)) return;

    setAiLoadingProject(projectId); 
    setError("");
    setAiRecommendedPartners((prev) => ({ ...prev, [projectId]: null }));

    try {
      const response = await fetch("/api/proxy", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userUid, project_id: projectId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unknown AI service error");

      setAiRecommendedPartners((prev) => ({
        ...prev,
        [projectId]: data.recommended_partner || null,
      }));
    } catch (error) {
      console.error("❌ AI Partner Finder Error:", error);
      setError("AI Partner Finder service is unavailable.");
    }

    setAiLoadingProject(null); 
  };

  const handleApply = async (projectId, partnerUid) => {
    if (!partnerUid) return alert("Please enter or confirm a partner.");

    setLoadingProject(projectId); 
    setError("");

    try {
      const response = await fetch("/api/projects/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, partnerUid }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Application failed");

      alert("Application submitted successfully!");
      setAppliedProjects((prev) => new Set([...prev, projectId])); 
      setPartnerUids((prev) => ({ ...prev, [projectId]: "" }));

      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj._id === projectId
            ? { ...proj, applicants: [...(proj.applicants || []), { uid: userUid, partner_uid: partnerUid, status: "pending" }] }
            : proj
        )
      );
    } catch (error) {
      console.error("Error applying:", error);
      setError(error.message);
    }

    setLoadingProject(null);
  };

  return (
    <div className="mt-6">
      {projects.filter((p) => (p.final_allocation?.length || 0) === 0).length === 0 ? (
  <p>No available projects. All have been allocated.</p>
) : (
  projects
    .filter((project) => (project.final_allocation?.length || 0) === 0) // ✅ Only show if not allocated
    .map((project) => {

          const alreadyApplied = appliedProjects.has(project._id) || 
            project.applicants?.some((app) => app.uid === userUid);

          return (
            <div key={project._id} className="bg-white p-4 rounded shadow mt-2">
              <h3 className="font-bold">{project.title}</h3>
              <p>{project.description}</p>
              <p className="text-sm text-gray-600"><strong>Posted by:</strong> {project.createdByName || "Unknown"}</p>
              <p className="text-sm text-gray-600"><strong>Required Tech:</strong> {project.required_techstacks.join(", ")}</p>

              {!alreadyApplied && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Enter Partner UID"
                    value={partnerUids[project._id] || ""}
                    onChange={(e) => setPartnerUids((prev) => ({ ...prev, [project._id]: e.target.value }))}
                    className="w-full p-2 border rounded mb-2"
                    required
                  />

                  <button
                    onClick={() => findAiPartner(project._id)}
                    className={`p-2 rounded w-full mb-2 ${aiLoadingProject === project._id ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 text-white"}`}
                    disabled={aiLoadingProject === project._id}
                  >
                    {aiLoadingProject === project._id ? "Finding Partner..." : "AI Partner Finder"}
                  </button>

                  {aiRecommendedPartners[project._id] && (
                    <div className="bg-gray-100 p-2 rounded text-sm text-gray-700">
                      <p>AI Recommended Partner: <strong>{aiRecommendedPartners[project._id]}</strong></p>
                      <button
                        onClick={() => handleApply(project._id, aiRecommendedPartners[project._id])}
                        className="mt-2 p-2 rounded bg-green-500 text-white w-full"
                      >
                        Apply with {aiRecommendedPartners[project._id]}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleApply(project._id, partnerUids[project._id])}
                    className={`p-2 rounded w-full ${
                      loadingProject === project._id ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"
                    }`}
                    disabled={loadingProject === project._id}
                  >
                    {loadingProject === project._id ? "Applying..." : "Apply with Partner"}
                  </button>
                </div>
              )}

              {alreadyApplied && (
                <div className="mt-2 text-center text-gray-500 font-semibold">✅ Already Applied</div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
