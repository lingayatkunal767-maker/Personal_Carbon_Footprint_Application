import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Handle Input Change
 const handleChange = (e) => {
  const { name, value } = e.target;

  const updatedForm = {
    ...formData,
    [name]: value,
  };

  setFormData(updatedForm);
  setErrors(validate(updatedForm));
};


  // Validate Form
  const validate = (data= formData) => {
  let newErrors = {};

  // Email validation
  if (!formData.email) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Enter a valid email address";
  }

  // Password validation
  if (!formData.password) {
    newErrors.password = "Password is required";
  } else if (formData.password.length < 8) {
    newErrors.password = "Password must be at least 8 characters";
  }

  return newErrors;
};
const isFormValid =
  formData.email &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
  formData.password &&
  formData.password.length >= 6;


  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // 👉 Temporary fake authentication
      // Later this will connect to backend

      console.log("Login Successful:", formData);

      // Navigate to dashboard
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-green-700">
          CarbonCalc 🌱
        </h1>

        <p className="text-gray-500 text-center mb-4">
          Track and reduce your carbon footprint
        </p>

        <h2 className="text-xl font-semibold text-center text-green-600 mb-6">
          Login 🌿
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <Link
            to="/forgot-password"
            className="text-sm text-green-600 text-right hover:underline"
          >
            Forgot Password?
          </Link>

          {/* Login Button */}
          <Link
            to="/dashboard"
            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center"
          >
            Login
          </Link>

        </form>

      </div>
    </div>
  );
}
