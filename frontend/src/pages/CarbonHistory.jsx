import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function CarbonHistory() {
  const navigate = useNavigate();

  const [emissions, setEmissions] = useState([]);
  const [filteredEmissions, setFilteredEmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ITEMS_PER_PAGE = 5;

  // Fetch emissions on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      try {
        const data = await apiFetch("/api/emissions");
        if (mounted) {
          setEmissions(data || []);
        }
      } catch (err) {
        if (err.status === 401) navigate("/login");
        else setError(err.message || "Could not load emissions.");
      } finally {
        setLoading(false);
      }
    };
    load();

    
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Filter emissions based on category and date range
  useEffect(() => {
    let filtered = emissions || [];

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((e) => {
        const eDate = new Date(e.createdAt || e.date);
        return eDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => {
        const eDate = new Date(e.createdAt || e.date);
        return eDate <= end;
      });
    }

    setFilteredEmissions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [emissions, selectedCategory, startDate, endDate]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedEmissions = filteredEmissions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Calculate summary stats
  const totalEmission = emissions.reduce(
    (sum, e) => sum + (e.carbonOutput || 0),
    0
  );
  const monthsOfData =
    emissions.length > 0 ? Math.ceil(emissions.length / 30) : 1;
  const averageMonthly = totalEmission / monthsOfData;

  const categoryTotals = emissions.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + (e.carbonOutput || 0);
    return acc;
  }, {});
  const bestCategory = Object.keys(categoryTotals).length
    ? Object.entries(categoryTotals).reduce((a, b) =>
        a[1] < b[1] ? a : b
      )[0]
    : "N/A";

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Category", "Activity Type", "Quantity", "CO2 (kg)"];
    const rows = filteredEmissions.map((e) => [
      new Date(e.createdAt || e.date).toLocaleDateString(),
      e.category || "-",
      e.activityType || "-",
      e.quantity || "-",
      e.carbonOutput || "-",
    ]);

    const csvContent =
      [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carbon-history.csv";
    a.click();
  };

  // Delete emission
  const handleDeleteEmission = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await apiFetch(`/api/emissions/${id}`, {
        method: "DELETE",
      });
      setEmissions((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      if (err.status === 401) navigate("/login");
      else setError(err.message || "Failed to delete record.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white border-t-green-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading your carbon history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4edda] via-[#b5dfca] to-[#5cb578]">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-800">CarbonCalc</span>
            <span className="text-xl">🌱</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="text-sm text-green-800 hover:text-green-900 font-semibold transition"
              >
                Dashboard
              </Link>
              <span className="text-sm text-green-800 font-semibold border-b-2 border-green-600 pb-0.5">
                Carbon History
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 bg-green-800 hover:bg-green-900 text-white text-sm px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-900">Carbon History</h1>
            <p className="text-green-800/70 mt-1">
              Analyze your environmental progress and historical log data.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white/90 hover:bg-white text-green-700 font-semibold px-4 py-3 rounded-lg shadow-md transition"
            >
              <span>📥</span> Export CSV
            </button>
            <Link
              to="/lifestyle-survey"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg shadow-md transition"
            >
              <span>📝</span> Update Profile
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Date Range Picker */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
              />
            </div>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="self-end bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {["All Categories", "Transport", "Food", "Energy"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-lg font-semibold transition ${
                    selectedCategory === category
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category === "All Categories" ? "📊" : ""}
                  {category === "Transport" ? "🚗" : ""}
                  {category === "Food" ? "🥗" : ""}
                  {category === "Energy" ? "⚡" : ""} {category}
                </button>
              )
            )}
          </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Activity Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    CO₂ (kg)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedEmissions.length > 0 ? (
                  displayedEmissions.map((emission, idx) => (
                    <tr
                      key={emission.id}
                      className={`border-b border-gray-100 transition hover:bg-green-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(
                          emission.createdAt || emission.date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            emission.category === "Transport"
                              ? "bg-blue-100 text-blue-700"
                              : emission.category === "Food"
                              ? "bg-orange-100 text-orange-700"
                              : emission.category === "Energy"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {emission.category || "Other"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {emission.activityType || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {emission.quantity || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {emission.carbonOutput || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteEmission(emission.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <p className="text-gray-500 font-medium">
                        No emissions recorded for the selected filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} of{" "}
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredEmissions.length)}{" "}
                entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(5, totalPages) }).map(
                  (_, idx) => {
                    const pageNum =
                      totalPages <= 5
                        ? idx + 1
                        : Math.max(1, currentPage - 2) + idx;
                    return pageNum <= totalPages ? (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded font-medium transition ${
                          currentPage === pageNum
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  }
                )}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              AVERAGE MONTHLY
            </p>
            <p className="text-3xl font-bold text-green-700">
              {averageMonthly.toFixed(0)} kg CO₂e
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              BEST CATEGORY
            </p>
            <p className="text-3xl font-bold text-green-700">{bestCategory}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm font-semibold mb-2">
              TOTAL AUDITED
            </p>
            <p className="text-3xl font-bold text-green-700">
              {totalEmission.toFixed(0)} kg CO₂e
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 mt-12 text-white/80 text-sm">
        © 2024 CarbonCalc · Environmentally Conscious Tracking
      </footer>
    </div>
  );
}
