import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-green-700">
           CarbonCalc  🌱
          </h1>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back 👋
          </h1>
          <p className="text-gray-500">
            Your carbon footprint tracker
          </p>
        </div>

        <Link
          to="/login"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </Link>
      </div>

      {/* Emission Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Emissions</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            120 kg CO₂
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">This Month</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            30 kg CO₂
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Goal Progress</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            65%
          </p>
        </div>

      </div>

      {/* Add Emission Section */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Add New Emission
        </h2>

        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
          + Add Emission
        </button>
      </div>

    </div>
  );
}
