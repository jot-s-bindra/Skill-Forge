"use client";
import { useEffect, useState } from "react";

export default function Projects({ role }) {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStacks, setTechStacks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [partnerUid, setPartnerUid] = useState(""); 
  const [userUid, setUserUid] = useState(""); 
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (res.ok) {
          setProjects(data.projects);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    fetchProjects();

    async function fetchUserUid() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (res.ok) {
          setUserUid(data.uid); 
        }
      } catch (error) {
        console.error("Error fetching user UID:", error);
      }
    }

    fetchUserUid();
  }, []);


  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        required_techstacks: techStacks.split(",").map((stack) => stack.trim()),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setProjects([...projects, { title, description, required_techstacks: techStacks.split(",") }]);
      setTitle("");
      setDescription("");
      setTechStacks("");
      setShowForm(false);
    } else {
      setError(data.message || "Failed to add project");
    }

    setLoading(false);
  };

  const handleApply = async (projectId) => {
    if (!partnerUid) {
      alert("Please enter your partner's UID.");
      return;
    }
  
    setLoading(true);
    setError("");
  
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
  
      setPartnerUid(""); 
    } else {
      setError(data.message || "Failed to apply for project");
    }
  
    setLoading(false);
  };
  

  return (
    <div>
      <p className="text-gray-700">Academic projects listed by professors.</p>

      {role === "teacher" && (
        <div className="mt-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-4 bg-blue-500 text-white p-2 rounded"
          >
            {showForm ? "Close Form" : "Add Project"}
          </button>

          {showForm && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-bold mb-2">Add a Project</h3>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <form onSubmit={handleAddProject}>
                <input
                  type="text"
                  placeholder="Project Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <textarea
                  placeholder="Project Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Required Tech Stacks (comma separated)"
                  value={techStacks}
                  onChange={(e) => setTechStacks(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white p-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Project"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        {projects.length === 0 ? (
          <p>No projects available yet.</p>
        ) : (
          projects.map((project, index) => {
            const alreadyApplied = project.applications?.some((app) => app.uid === userUid);

            return (
              <div key={index} className="bg-white p-4 rounded shadow mt-2">
                <h3 className="font-bold">{project.title}</h3>
                <p>{project.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Posted by:</strong> {project.createdByName || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Required Tech:</strong> {project.required_techstacks.join(", ")}
                </p>

                {role === "student" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="Enter Partner UID"
                      value={partnerUid}
                      onChange={(e) => setPartnerUid(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      required
                    />
                    <button
                      onClick={() => handleApply(project._id)}
                      className={`p-2 rounded w-full ${alreadyApplied ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                      disabled={loading || alreadyApplied}
                    >
                      {loading ? "Applying..." : alreadyApplied ? "Already Applied" : "Apply with Partner"}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
