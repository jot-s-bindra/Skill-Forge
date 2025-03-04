"use client";
import { useState } from "react";

export default function TeacherProjects({ projects, setProjects }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStacks, setTechStacks] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      setProjects((prev) => [...prev, { title, description, required_techstacks: techStacks.split(",") }]);
      setTitle("");
      setDescription("");
      setTechStacks("");
      setShowForm(false);
    } else {
      setError(data.message || "Failed to add project");
    }

    setLoading(false);
  };

  return (
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

      <h3 className="text-lg font-bold mt-6">All Projects</h3>
      <div className="mt-4">
        {projects.length === 0 ? (
          <p>No projects available yet.</p>
        ) : (
          projects.map((project, index) => (
            <div key={index} className="bg-white p-4 rounded shadow mt-2">
              <h3 className="font-bold">{project.title}</h3>
              <p>{project.description}</p>
              <p className="text-sm text-gray-600">
                <strong>Posted by:</strong> {project.createdBy || "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Required Tech:</strong> {project.required_techstacks.join(", ")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
