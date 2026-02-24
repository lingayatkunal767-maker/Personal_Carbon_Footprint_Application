import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="h-screen relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(160deg, #d4edda 0%, #b8e6c8 30%, #8fd4a4 60%, #5cb578 100%)",
      }}
    >
      {/* Background decorative illustration — realistic leaves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large leaf top-right */}
        <svg className="absolute right-10 top-12 w-[360px] h-[360px] opacity-[0.10]" viewBox="0 0 120 120" fill="none">
          <path d="M60 10 C40 15, 15 35, 12 65 C10 85, 25 105, 55 108 C65 109, 75 100, 85 85 C100 60, 95 30, 60 10Z" fill="#22a34a"/>
          <path d="M55 108 L48 118" stroke="#1a6e30" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M55 108 C50 85, 48 60, 60 20" stroke="#1a6e30" strokeWidth="1.8" fill="none"/>
          <path d="M52 90 C42 85, 30 88, 20 82" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M50 75 C40 68, 28 70, 18 62" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M48 58 C38 52, 28 52, 22 45" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M52 42 C45 38, 38 38, 32 32" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M55 80 C65 75, 78 78, 88 72" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M52 65 C62 58, 75 58, 85 50" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M54 48 C62 42, 72 40, 82 34" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M58 32 C65 28, 72 26, 78 22" stroke="#1a6e30" strokeWidth="1" fill="none"/>
        </svg>
        {/* Medium leaf mid-right */}
        <svg className="absolute right-52 top-[55%] w-[220px] h-[220px] opacity-[0.08] rotate-[35deg]" viewBox="0 0 120 120" fill="none">
          <path d="M60 10 C40 15, 15 35, 12 65 C10 85, 25 105, 55 108 C65 109, 75 100, 85 85 C100 60, 95 30, 60 10Z" fill="#22a34a"/>
          <path d="M55 108 L48 118" stroke="#1a6e30" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M55 108 C50 85, 48 60, 60 20" stroke="#1a6e30" strokeWidth="1.8" fill="none"/>
          <path d="M52 90 C42 85, 30 88, 20 82" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M50 75 C40 68, 28 70, 18 62" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M48 58 C38 52, 28 52, 22 45" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M55 80 C65 75, 78 78, 88 72" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M52 65 C62 58, 75 58, 85 50" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M54 48 C62 42, 72 40, 82 34" stroke="#1a6e30" strokeWidth="1" fill="none"/>
        </svg>
        {/* Small leaf bottom-right */}
        <svg className="absolute right-4 bottom-16 w-[160px] h-[160px] opacity-[0.09] -rotate-[25deg]" viewBox="0 0 120 120" fill="none">
          <path d="M60 10 C40 15, 15 35, 12 65 C10 85, 25 105, 55 108 C65 109, 75 100, 85 85 C100 60, 95 30, 60 10Z" fill="#22a34a"/>
          <path d="M55 108 L48 118" stroke="#1a6e30" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M55 108 C50 85, 48 60, 60 20" stroke="#1a6e30" strokeWidth="1.8" fill="none"/>
          <path d="M50 75 C40 68, 28 70, 18 62" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M55 80 C65 75, 78 78, 88 72" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M52 65 C62 58, 75 58, 85 50" stroke="#1a6e30" strokeWidth="1" fill="none"/>
        </svg>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-16 py-5 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-bold text-green-900 tracking-tight">CarbonCalc</span>
          <span className="text-2xl">🌱</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link
            to="/login"
            className="text-lg text-green-900 font-medium hover:text-green-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-green-800 text-white font-semibold rounded-full hover:bg-green-900 transition shadow-md text-lg"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex-1 flex items-center px-8 md:px-16">
        <div className="flex flex-col lg:flex-row items-start gap-10 max-w-7xl mx-auto w-full">
          {/* Left Column – Hero */}
          <div className="flex-1 max-w-2xl">
            {/* Badge */}
            <span className="inline-block px-5 py-1.5 bg-green-900/10 text-green-900 text-sm font-bold uppercase tracking-widest rounded-full mb-5">
              Track Carbon, Real Impact
            </span>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-green-950 leading-tight mb-5">
              Reduce your footprint, build a greener future.
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-green-900/70 leading-relaxed mb-8 max-w-lg">
              Track and reduce your personal carbon emissions with a simple dashboard.
              Build sustainable habits and lower your environmental impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to="/register"
                className="px-8 py-3 bg-green-800 text-white font-semibold rounded-full hover:bg-green-900 transition shadow-lg text-base"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-green-900 text-green-900 font-semibold rounded-full hover:bg-green-900/5 transition text-base"
              >
                I already have an account
              </Link>
            </div>

            {/* Bottom Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-green-800 text-base mb-1.5">Why it matters</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The average person produces 4.7 tonnes of CO₂ per year.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-green-800 text-base mb-1.5">What we do</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Track emissions from transport, energy, food, and daily habits.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column – Feature Cards (stacked) */}
          <div className="flex-1 max-w-md w-full flex flex-col gap-5 lg:pt-6">
            {/* Card 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-7 py-6 shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-green-900 text-lg">Track your emissions</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                Log daily activities — transport, electricity, food — and see your CO₂ footprint clearly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-7 py-6 shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-green-900 text-lg">Reduce your impact</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                Get personalized tips and insights to lower your footprint each week.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-7 py-6 shadow-md hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-green-900 text-lg">Go green together</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                Join a community working towards a sustainable planet. Every step counts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
