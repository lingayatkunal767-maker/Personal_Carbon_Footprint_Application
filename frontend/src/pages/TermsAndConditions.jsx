import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-100 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-10 border border-green-100">

        <h1 className="text-4xl font-bold text-emerald-700 mb-4">
          📜 Terms & Conditions – EcoTrack
        </h1>

        <p className="text-gray-500 mb-8">
          Last Updated: February 2026
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              1. Use of the Application
            </h2>
            <p>
              EcoTrack provides carbon footprint tracking and sustainability insights.
              The data is informational and not professional environmental advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              2. User Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information</li>
              <li>Maintain account confidentiality</li>
              <li>Use the platform legally and ethically</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              3. Intellectual Property
            </h2>
            <p>
              All EcoTrack branding, features, and software components
              are protected intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              4. Limitation of Liability
            </h2>
            <p>
              EcoTrack shall not be liable for indirect or consequential damages
              resulting from use of the platform.
            </p>
          </section>

        </div>

        <div className="mt-10 text-center text-sm text-gray-400">
          EcoTrack – Building a Greener Future 🌍
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;