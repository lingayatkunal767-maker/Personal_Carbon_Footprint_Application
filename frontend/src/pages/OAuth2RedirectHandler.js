import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";

function OAuth2RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Brief delay so "Signing you in…" is visible (same experience as Google)
      const t = setTimeout(() => navigate("/dashboard"), 1000);
      return () => clearTimeout(t);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h2>Signing you in…</h2>
        <p>Please wait while we complete your login.</p>
      </div>
    </div>
  );
}

export default OAuth2RedirectHandler;
