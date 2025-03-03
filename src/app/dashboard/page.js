"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("hackathons");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          router.push("/login"); 
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-5">
      {/* Logo */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Skill-Forge</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`p-2 px-4 rounded ${activeTab === "hackathons" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("hackathons")}
        >
          Hackathons
        </button>
        <button
          className={`p-2 px-4 rounded ${activeTab === "icpc" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("icpc")}
        >
          ICPC Team Selections
        </button>
        <button
          className={`p-2 px-4 rounded ${activeTab === "projects" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("projects")}
        >
          Academic Projects
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-2xl bg-white p-6 rounded shadow-md">
        {activeTab === "hackathons" && <Hackathons />}
        {activeTab === "icpc" && <ICPC />}
        {activeTab === "projects" && <Projects />}
      </div>
    </div>
  );
}

function Hackathons() {
  return <p className="text-gray-700">List of upcoming hackathons will be shown here.</p>;
}

function ICPC() {
  return <p className="text-gray-700">ICPC team selection recommendations will be shown here.</p>;
}

function Projects() {
  return <p className="text-gray-700">Academic projects listed by professors will be shown here.</p>;
}
