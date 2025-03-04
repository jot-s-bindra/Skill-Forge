export default function Projects({ role }) {
    return (
      <div>
        <p className="text-gray-700">Academic projects listed by professors.</p>
        {role === "teacher" && <button className="mt-4 bg-green-500 text-white p-2 rounded">Add Project</button>}
      </div>
    );
  }
  