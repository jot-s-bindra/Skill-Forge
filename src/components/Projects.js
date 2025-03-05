"use client";
import { useEffect, useState } from "react";
import TeacherProjects from "./TeacherProjects";
import StudentProjects from "./StudentProjects";

export default function Projects({ role }) {
  const [projects, setProjects] = useState([]);
  const [userUid, setUserUid] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (res.ok) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

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

    fetchProjects();
    fetchUserUid();
  }, []);

  return (
    <div>
      <p className="text-gray-700">Academic projects listed by professors.</p>
      
      {role === "teacher" && <TeacherProjects projects={projects} setProjects={setProjects} />}
      {role === "student" && <StudentProjects projects={projects} userUid={userUid} setProjects={setProjects} />}
    </div>
  );
}
