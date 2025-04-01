"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Hackathons from "@/components/Hackathons";
import Projects from "@/components/Projects";
import TeacherManagement from "@/components/TeacherManagement"; 

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
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Skill-Forge</h1>
      <p className="text-gray-600">Logged in as: <strong>{user.role}</strong></p>

      <div className="flex flex-wrap space-x-4 mb-6">
        <button
          className={`p-2 px-4 rounded ${activeTab === "hackathons" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("hackathons")}
        >
          Hackathons
        </button>

        <button
          className={`p-2 px-4 rounded ${activeTab === "projects" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("projects")}
        >
          Academic Projects
        </button>

        {user.role === "teacher" && (
          <button
            className={`p-2 px-4 rounded ${activeTab === "management" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setActiveTab("management")}
          >
            Management
          </button>
        )}
      </div>

      <div className="w-full max-w-3xl bg-white p-6 rounded shadow-md">
        {activeTab === "hackathons" && <Hackathons role={user.role} />}
        {activeTab === "projects" && <Projects role={user.role} />}
        {activeTab === "management" && user.role === "teacher" && (
          <TeacherManagement userUid={user.uid} />
        )}
      </div>
    </div>
  );
}
