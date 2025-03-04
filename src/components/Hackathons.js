export default function Hackathons({ role }) {
    return (
      <div>
        <p className="text-gray-700">List of upcoming hackathons.</p>
        {role === "admin" && <button className="mt-4 bg-green-500 text-white p-2 rounded">Add Hackathon</button>}
      </div>
    );
  }
  