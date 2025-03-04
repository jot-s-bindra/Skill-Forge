export default function ICPC({ role }) {
    return (
      <div>
        <p className="text-gray-700">ICPC team selection recommendations.</p>
        {role === "admin" && <button className="mt-4 bg-green-500 text-white p-2 rounded">Add ICPC Event</button>}
      </div>
    );
  }
  