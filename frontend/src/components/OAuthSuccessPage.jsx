import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  
  useEffect(() => {
  const token = searchParams.get("token");
  const email = searchParams.get("email"); 
  // Ensure we match the backend key: 'needsVerification'
  const needsVerification = searchParams.get("needsVerification") === "true";

  if (token) {
    localStorage.setItem("token", token);

    if (needsVerification) {
      // Manual verification requires the email to be in localStorage
      if (email) {
        localStorage.setItem("verifyEmail", email);
      }
      navigate("/verify-otp", { replace: true });
    } else {
      localStorage.setItem("user", JSON.stringify({ username: "OAuth User", email: email }));
      navigate("/dashboard", { replace: true });
    }
  } else {
    navigate("/", { replace: true });
  }
}, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
      <p className="text-emerald-800 font-bold">Verifying account status...</p>
    </div>
  );
};

export default OAuthSuccess;