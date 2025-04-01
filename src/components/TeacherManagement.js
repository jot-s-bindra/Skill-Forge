"use client";
import { useState, useEffect } from "react";

export default function TeacherManagement({ userUid }) {
  const [projects, setTeacherProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/projects?teacherUid=${userUid}`);
        const data = await response.json();

        if (response.ok) {
          setTeacherProjects(data.projects);
        } else {
          setError(data.message || "Failed to fetch projects");
        }
      } catch (error) {
        console.error("❌ Error fetching teacher projects:", error);
        setError("Failed to fetch projects. Please try again.");
      }

      setLoading(false);
    };

    if (userUid) {
      fetchProjects();
    }
  }, [userUid]);

  const handleApproval = async (projectId, studentUid, approve = true) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, studentUid, approve }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(approve ? "Application approved!" : "Application rejected!");

        // Update local state
        setTeacherProjects((prevProjects) =>
          prevProjects.map((proj) =>
            proj._id === projectId
              ? {
                  ...proj,
                  final_allocation: approve
                    ? [...proj.final_allocation, { uid: studentUid }]
                    : proj.final_allocation,
                  applicants: proj.applicants.filter((app) => app.uid !== studentUid),
                }
              : proj
          )
        );
      } else {
        setError(data.message || "Failed to update application status");
      }
    } catch (error) {
      console.error("❌ Error approving/rejecting application:", error);
      setError("Error processing request.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {projects.length === 0 ? (
        <p>No projects found. Please add some projects.</p>
      ) : (
        projects.map((project) => (
          <div key={project._id} className="bg-white p-4 rounded shadow mt-4">
            <h3 className="font-bold">{project.title}</h3>
            <p>{project.description}</p>
            <p className="text-sm text-gray-600">
              <strong>Required Tech:</strong> {project.required_techstacks.join(", ")}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Applicants:</strong> {project.applicants.length}
            </p>

            {project.applicants.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-sm font-semibold">Applicants</h4>
                <ul className="space-y-2">
                  {project.applicants.map((app) => (
                    <li key={app.uid} className="flex justify-between items-center">
                      <span>{app.uid}</span>
                      <div>
                        <button
                          onClick={() => handleApproval(project._id, app.uid, true)}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(project._id, app.uid, false)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No applicants yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
