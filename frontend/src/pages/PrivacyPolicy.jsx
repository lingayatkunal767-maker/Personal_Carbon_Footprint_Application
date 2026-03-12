import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-10 border border-green-100">

        <h1 className="text-4xl font-bold text-emerald-700 mb-4">
          🌱 Privacy Policy – EcoTrack
        </h1>

        <p className="text-gray-500 mb-8">
          Last Updated: February 2026
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address during registration</li>
              <li>Carbon footprint inputs (transport, electricity, lifestyle)</li>
              <li>Authentication data secured with JWT</li>
              <li>Usage analytics for performance improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              2. How We Use Your Data
            </h2>
            <p>
              EcoTrack uses your data to calculate carbon emissions,
              generate sustainability insights, and improve platform performance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              3. Data Protection
            </h2>
            <p>
              We implement encrypted password storage and secure
              authentication mechanisms. Your data is never sold or shared.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
              4. Your Rights
            </h2>
            <p>
              You may request access, update, or deletion of your data
              at any time.
            </p>
          </section>

        </div>

        <div className="mt-10 text-center text-sm text-gray-400">
          EcoTrack – Track. Reduce. Sustain.
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;