import React, { useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";

const PolicyModal = ({ onAccept }) => {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    localStorage.setItem("ecoTrackPolicyAccepted", "true");
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Terms & Privacy Policy</h2>
              <p className="text-sm opacity-90">
                Please review before continuing
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">

          <div className="border border-green-100 bg-green-50/40 rounded-xl p-4 max-h-52 overflow-y-auto text-gray-700 text-sm space-y-3">

            <p>
              Welcome to <span className="font-semibold text-green-700">EcoTrack</span>.
              By using this platform, you agree to monitor and manage your
              carbon footprint responsibly.
            </p>

            <p>
              We collect only necessary information such as account details
              and usage metrics to improve your sustainability insights.
            </p>

            <p>
              Your data is protected and will never be sold or shared with
              third parties.
            </p>

            <p>
              Continued use of EcoTrack means you accept our Terms of Service
              and Privacy Policy.
            </p>

          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-3 mt-6">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-sm text-gray-600">
              I have read and agree to the Terms & Privacy Policy
            </span>
          </div>

          {/* Button */}
          <div className="flex justify-end mt-6">
            <button
              disabled={!checked}
              onClick={handleAccept}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 
              ${checked 
                ? "bg-green-600 hover:bg-green-700 text-white shadow-md" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              Continue to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PolicyModal;