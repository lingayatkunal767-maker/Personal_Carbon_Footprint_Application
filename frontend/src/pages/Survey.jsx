import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateCarbon } from "../services/carbonService";
import { apiFetch } from "../utils/api";

function Survey() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    distance: "",
    meals: "",
    electricity: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = calculateCarbon(form);

    const existingLogs =
      JSON.parse(localStorage.getItem("carbonLogs")) || [];

    localStorage.setItem(
      "carbonLogs",
      JSON.stringify([...existingLogs, result])
    );

    alert("Carbon Calculated Successfully 🌱");
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <h2>Lifestyle Survey</h2>

      <form onSubmit={handleSubmit} className="card">
        <h3>Transport</h3>
        <input
          type="number"
          name="distance"
          placeholder="Distance per day (km)"
          required
          onChange={handleChange}
        />

        <h3>Food</h3>
        <input
          type="number"
          name="meals"
          placeholder="Meals per day"
          required
          onChange={handleChange}
        />

        <h3>Energy</h3>
        <input
          type="number"
          name="electricity"
          placeholder="Electricity usage (kWh)"
          required
          onChange={handleChange}
        />

        <button type="submit">Submit Survey</button>
      </form>
    </div>
  );
}

export default Survey;