"use client";
import { useState } from "react";

export default function StudentProjects({ projects, userUid, setProjects }) {
  const [partnerUids, setPartnerUids] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendedPartner, setAiRecommendedPartner] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const findAiPartner = async (projectId) => {
    setAiLoading(true);
    setError("");
    setSelectedProject(projectId);
    setAiRecommendedPartner(null);
  
    try {
      const response = await fetch("/api/proxy", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userUid, project_id: projectId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error from AI service");
      }
  
      const data = await response.json();
      if (data.recommended_partner) {
        setAiRecommendedPartner(data.recommended_partner);
      } else {
        setError(data.message || "No suitable partner found.");
      }
    } catch (error) {
      console.error("❌ AI Partner Finder Error:", error);
      setError("AI Partner Finder service is unavailable.");
    }
  
    setAiLoading(false);
  };
  

  
  const handleApply = async (projectId, partnerUid) => {
    if (!partnerUid) {
      alert("Please enter or confirm a partner.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, partnerUid }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Application submitted successfully!");

        setProjects((prevProjects) =>
          prevProjects.map((proj) =>
            proj._id === projectId
              ? {
                  ...proj,
                  applicants: [...(proj.applicants || []), { uid: userUid, partner_uid: partnerUid, status: "pending" }],
                }
              : proj
          )
        );

        setPartnerUids((prev) => ({ ...prev, [projectId]: "" }));
      } else {
        setError(data.message || "Failed to apply for project");
      }
    } catch (error) {
      console.error("Error applying:", error);
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      {projects.length === 0 ? (
        <p>No projects available yet.</p>
      ) : (
        projects.map((project) => {
          const alreadyApplied = project.applicants?.some((app) => app.uid === userUid);

          return (
            <div key={project._id} className="bg-white p-4 rounded shadow mt-2">
              <h3 className="font-bold">{project.title}</h3>
              <p>{project.description}</p>
              <p className="text-sm text-gray-600">
                <strong>Posted by:</strong> {project.createdByName || "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Required Tech:</strong> {project.required_techstacks.join(", ")}
              </p>

              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter Partner UID"
                  value={partnerUids[project._id] || ""}
                  onChange={(e) =>
                    setPartnerUids((prev) => ({ ...prev, [project._id]: e.target.value }))
                  }
                  className="w-full p-2 border rounded mb-2"
                  required
                />

                <button
                  onClick={() => findAiPartner(project._id)}
                  className="p-2 rounded bg-purple-500 text-white w-full mb-2"
                  disabled={aiLoading}
                >
                  {aiLoading ? "Finding Partner..." : "AI Partner Finder"}
                </button>

                {selectedProject === project._id && aiRecommendedPartner && (
                  <div className="bg-gray-100 p-2 rounded text-sm text-gray-700">
                    <p>AI Recommended Partner: <strong>{aiRecommendedPartner}</strong></p>
                    <button
                      onClick={() => handleApply(project._id, aiRecommendedPartner)}
                      className="mt-2 p-2 rounded bg-green-500 text-white w-full"
                    >
                      Apply with {aiRecommendedPartner}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleApply(project._id, partnerUids[project._id])}
                  className={`p-2 rounded w-full ${
                    alreadyApplied ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"
                  }`}
                  disabled={loading || alreadyApplied}
                >
                  {loading ? "Applying..." : alreadyApplied ? "Already Applied" : "Apply with Partner"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
