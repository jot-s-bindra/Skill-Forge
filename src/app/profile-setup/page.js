"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSetup() {
  const [codeforcesId, setCodeforcesId] = useState("");
  const [techStacks, setTechStacks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeforcesId, techStacks: techStacks.split(",") }),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/dashboard"); 
    } else {
      setError(data.message || "Failed to update profile.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Codeforces ID"
            value={codeforcesId}
            onChange={(e) => setCodeforcesId(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <input
            type="text"
            placeholder="Enter Tech Stacks (comma separated)"
            value={techStacks}
            onChange={(e) => setTechStacks(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
