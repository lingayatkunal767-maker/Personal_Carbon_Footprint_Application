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
    <>
      <Outlet />
    </>
  );
}

export default Layout;