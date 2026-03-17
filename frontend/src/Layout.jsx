import { Link, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
function Layout() {
    const [user, setUser] = useState(null);
    useEffect(() => {
  async function loadUser() {
    try {
      const res = await fetch("http://localhost:9599/api/users/me", {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.log("User not logged in");
    }
  }

  loadUser();
}, []);
  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-5">
        <Link to="/dashboard">
  <h1 className="text-green-600 font-bold text-xl mb-8 cursor-pointer">
    CarbonCalc
  </h1>
</Link>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block text-green-600 font-medium">
            Dashboard
          </Link>

          <Link to="/badges" className="block text-gray-600 hover:text-green-600">
            Badges
          </Link>

          <Link to="/leaderboard" className="block text-gray-600 hover:text-green-600">
            Leaderboard
          </Link>
        </nav>
      </div>

      {/* Main Section */}
      <div className="flex-1 flex flex-col">

        {/* Top Navbar */}
        <div className="bg-white border-b p-4 flex justify-between items-center">

          {/* Search */}
          <input
            type="text"
            placeholder="Search goals or activities..."
            className="border rounded-lg px-4 py-2 w-80"
          />

          {/* Right Side */}
          <div className="flex items-center gap-4">

            {/* Settings */}
            <button className="text-gray-600 hover:text-green-600">
              ⚙️
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2">
  <img
    src={user?.image || "https://i.pravatar.cc/40"}
    className="w-8 h-8 rounded-full"
  />

  <div className="text-sm">
    <p className="font-semibold">{user?.email || "User"}</p>
    <p className="text-gray-400 text-xs">{user?.membership || "Member"}</p>
  </div>
</div>

          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default Layout;