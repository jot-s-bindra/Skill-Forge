"use client";
import { useState } from "react";

export default function StudentProjects({ projects, userUid, setProjects }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [partnerUids, setPartnerUids] = useState({});

  const handleApply = async (projectId) => {
    if (!partnerUids[projectId]) {
      alert("Please enter your partner's UID.");
      return;
    }

    setLoading(true);
    setError("");

    const response = await fetch("/api/projects/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, partnerUid: partnerUids[projectId] }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Application submitted successfully!");

      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj._id === projectId
            ? {
                ...proj,
                applicants: [...(proj.applicants || []), { uid: userUid, partner_uid: partnerUids[projectId], status: "pending" }],
              }
            : proj
        )
      );

      setPartnerUids((prev) => ({ ...prev, [projectId]: "" }));
    } else {
      setError(data.message || "Failed to apply for project");
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
                  onClick={() => handleApply(project._id)}
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
