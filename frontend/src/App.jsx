import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/Login";
import RegisterPage from "./components/RegisterPage"; 
import Dashboard from "./components/Dashboard"; // Import your new Dashboard component

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin-dashboard" element={<Dashboard />} /> 
    </Routes>
  );
}

export default App;