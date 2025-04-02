"use client";
import { useState, useEffect } from "react";

export default function AdminHackathons() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStacks, setTechStacks] = useState("");
  const [hackathons, setHackathons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    const res = await fetch("/api/hackathons");
    const data = await res.json();
    if (res.ok) setHackathons(data.hackathons);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/hackathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        required_techstacks: techStacks.split(",").map((t) => t.trim()),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setHackathons((prev) => [...prev, data.hackathon]);
      setTitle(""); setDescription(""); setTechStacks("");
    } else setError(data.message);
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-2">Create Hackathon</h2>
      <form onSubmit={handleAdd} className="mb-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border p-2 w-full mb-2" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="border p-2 w-full mb-2" required />
        <input value={techStacks} onChange={(e) => setTechStacks(e.target.value)} placeholder="Tech Stacks (comma-separated)" className="border p-2 w-full mb-2" required />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Add Hackathon</button>
      </form>
      {hackathons.map((hack) => (
        <div key={hack._id} className="bg-gray-100 p-4 rounded mb-2">
          <h3 className="font-bold">{hack.title}</h3>
          <p>{hack.description}</p>
          <p className="text-sm text-gray-600">Tech: {hack.required_techstacks.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
