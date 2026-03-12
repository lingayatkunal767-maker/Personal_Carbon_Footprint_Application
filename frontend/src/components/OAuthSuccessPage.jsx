import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

/**
 * Backend redirects here after Google/GitHub OAuth:
 *   /oauth-success?token=JWT&email=user@gmail.com&needsVerification=false
 *
 * If needsVerification=true (new OAuth user needs OTP), store email and go to /verify-otp.
 * Otherwise store token + fetch full user profile, then go to /dashboard.
 */
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token             = searchParams.get("token");
    const email             = searchParams.get("email");
    const needsVerification = searchParams.get("needsVerification") === "true";

    if (!token) { navigate("/", { replace: true }); return; }

    localStorage.setItem("token", token);

    if (needsVerification) {
      if (email) localStorage.setItem("verifyEmail", email);
      navigate("/verify-otp", { replace: true });
      return;
    }

    // Fetch full user details using the JWT so we store the same shape as normal login
    axios.get("http://localhost:8080/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard", { replace: true });
    })
    .catch(() => {
      // Fallback: store minimal user info and proceed
      localStorage.setItem("user", JSON.stringify({ email, name: email?.split("@")[0] || "User" }));
      navigate("/dashboard", { replace: true });
    });
  }, [navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4" />
      <p className="text-emerald-800 font-bold">Verifying account status...</p>
    </div>
  );
};

export default OAuthSuccess;
