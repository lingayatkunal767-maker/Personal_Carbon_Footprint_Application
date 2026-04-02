import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'

const FEATURES = [
  { icon: '📋', title: 'Carbon Tracking', desc: 'Submit lifestyle surveys covering transport, food, and energy. Get an instant kg CO₂ score with a full category breakdown.' },
  { icon: '🎯', title: 'Goal Setting', desc: 'Define weekly emission targets. The system auto-updates your progress after every survey submission.' },
  { icon: '🏆', title: 'Badges & Rewards', desc: 'Unlock eco-badges for milestones like your first survey, completing goals, and consistent tracking.' },
  { icon: '📊', title: 'Leaderboard', desc: 'See your rank among all users based on average emissions. Compete and inspire others to do better.' },
  { icon: '🛒', title: 'Eco Marketplace', desc: 'Spend your eco-points on green actions like tree planting, carbon offsets, and sustainable products.' },
  { icon: '🔔', title: 'Smart Notifications', desc: 'Get notified when you earn a badge, complete a goal, or when your emissions spike above normal.' },
]

const STEPS = [
  { n: '01', icon: '✍️', title: 'Sign Up', desc: 'Create a free account with just your email and password.' },
  { n: '02', icon: '📋', title: 'Take a Survey', desc: 'Answer quick questions about your daily transport, food, and energy habits.' },
  { n: '03', icon: '📈', title: 'Track Emissions', desc: 'View your carbon score, trend charts, and category breakdown on your dashboard.' },
  { n: '04', icon: '🎯', title: 'Set Goals', desc: 'Create emission reduction targets and monitor progress in real time.' },
  { n: '05', icon: '🌱', title: 'Earn Rewards', desc: 'Hit milestones to unlock badges, climb the leaderboard, and redeem eco-points.' },
]

const PROJECT_GOALS = [
  { icon: '🌍', title: 'Promote Sustainable Living', desc: 'Make carbon awareness part of everyday life by turning abstract emissions data into personal, actionable insights.' },
  { icon: '♻️', title: 'Reduce Carbon Footprints', desc: 'Give users the tools to measure, understand, and actively reduce their environmental impact over time.' },
  { icon: '📣', title: 'Raise Environmental Awareness', desc: 'Educate users on how transport, diet, and energy choices contribute to global carbon emissions.' },
  { icon: '🎮', title: 'Gamify Eco Behavior', desc: 'Use badges, leaderboards, and goals to make sustainability engaging, competitive, and rewarding.' },
]

const WHY_US = [
  { icon: '⚡', title: 'Real-Time Tracking', desc: 'Every survey instantly updates your dashboard, goals, and leaderboard rank.' },
  { icon: '🧠', title: 'Data-Driven Insights', desc: 'Visual charts and category breakdowns help you understand exactly where to cut back.' },
  { icon: '🎮', title: 'Gamified Experience', desc: 'Badges, ranks, and goals keep you motivated and coming back every day.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'JWT authentication, hashed passwords, and zero third-party data sharing.' },
]

const PRIVACY_POLICY = [
  { title: '1. Information We Collect', body: 'We collect only what is necessary: your name, email address, and hashed password at registration; and the lifestyle survey responses (transport, food, energy) that you voluntarily submit. We do not collect payment details, device identifiers, location data, or any sensitive personal information.' },
  { title: '2. How We Use Your Data', body: 'Your data is used solely to: calculate your personal carbon footprint, display your dashboard and emission history, evaluate goal progress, award badges, and rank you on the leaderboard. We do not use your data for advertising, profiling, or any purpose beyond the core app functionality.' },
  { title: '3. Data Sharing & Third Parties', body: 'We do not sell, rent, trade, or share your personal data with any third party under any circumstances. Leaderboard rankings display only your username (the part of your email before @) — never your full email or any other personal detail.' },
  { title: '4. Data Storage & Security', body: 'All data is stored in a secured PostgreSQL database. Passwords are hashed with BCrypt and are never stored or transmitted in plain text. All API endpoints are protected by JWT authentication — every request requires a valid, unexpired token issued at login.' },
  { title: '5. Your Rights & Data Control', body: 'You have the right to access, correct, or delete your data at any time. Goals, surveys, and notifications can be deleted directly within the app. To request full account deletion or a data export, email support@carboncalc.app and we will respond within 7 business days.' },
  { title: '6. Cookies & Tracking', body: 'CarbonCalc does not use cookies, tracking pixels, analytics scripts, or any third-party monitoring tools. Your session is managed via a JWT token stored in your browser localStorage, which is cleared automatically when you log out.' },
  { title: '7. Policy Updates', body: 'We may update this Privacy Policy periodically. The "Last updated" date at the top of this section will reflect any changes. Continued use of CarbonCalc after updates constitutes acceptance of the revised policy.' },
  { title: '8. Contact Us', body: 'For any privacy-related questions, concerns, or data requests, contact us at: support@carboncalc.app. We are committed to resolving all privacy concerns promptly and transparently.' },
]

const FAQ = [
  { q: 'Is CarbonCalc free to use?', a: 'Yes, completely free. Create an account, submit surveys, set goals, and earn badges at no cost.' },
  { q: 'How accurate are the carbon calculations?', a: 'Calculations use standard emission factors per transport type, diet category, and kWh usage. They are estimates based on your inputs — useful for tracking trends and relative improvement over time.' },
  { q: 'Can I delete my data?', a: 'Yes. You can delete individual goals, surveys, and notifications from within the app. For full account deletion, contact support@carboncalc.app.' },
  { q: 'How does the leaderboard work?', a: 'Rankings are based on your average carbon score across all surveys — lower is better. The leaderboard updates automatically after each survey you submit.' },
]

function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Privacy Policy</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: March 2026</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto divide-y divide-gray-100 px-7">
          {PRIVACY_POLICY.map(p => (
            <div key={p.title} className="py-5">
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="px-7 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  if (localStorage.getItem('token')) return <Navigate to="/dashboard" replace />
  const [openFaq, setOpenFaq] = useState(null)
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 scroll-smooth">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">🌿</div>
            <span className="text-lg font-extrabold text-gray-900">CarbonCalc</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-green-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-green-600 transition-colors">How it works</a>
            <a href="#goals" className="hover:text-green-600 transition-colors">Our Goals</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-24 pb-32 px-6">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 50%, #bbf7d0 0%, transparent 50%), radial-gradient(circle at 80% 20%, #a7f3d0 0%, transparent 50%)'}} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-8 border border-green-200">
            🌍 Personal Carbon Footprint Tracker
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            Track, reduce, and improve<br />
            <span className="text-green-600">your carbon footprint</span><br />
            effortlessly.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            CarbonCalc turns your daily habits into measurable data — then helps you set goals, earn rewards, and make a real difference for the planet.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/register" className="px-8 py-4 text-base font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5">
              Get Started Free →
            </Link>
            <Link to="/login" className="px-8 py-4 text-base font-bold text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-all shadow border border-gray-200 hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { v: '3', l: 'Emission Categories' },
              { v: '5+', l: 'Eco Badges' },
              { v: '100%', l: 'Free to Use' },
              { v: '0', l: 'Data Sold' },
            ].map(s => (
              <div key={s.l} className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm p-4 text-center">
                <p className="text-2xl font-extrabold text-green-600">{s.v}</p>
                <p className="text-xs text-gray-400 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Everything you need to go green</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From daily tracking to gamified rewards, CarbonCalc covers your full sustainability journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-7 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all cursor-default">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-5 group-hover:bg-green-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Start in 5 simple steps</h2>
            <p className="text-gray-400 max-w-xl mx-auto">No complicated setup. Just sign up and start tracking your impact today.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-green-100" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {STEPS.map(s => (
                <div key={s.n} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 bg-white border-2 border-green-200 rounded-2xl flex flex-col items-center justify-center mb-4 shadow-sm z-10">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs font-bold text-green-600 mt-0.5">{s.n}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Project Goals ── */}
      <section id="goals" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Why we built CarbonCalc</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Most people have no idea how their daily choices affect the planet. We built CarbonCalc to change that.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECT_GOALS.map(g => (
              <div key={g.title} className="flex gap-5 p-7 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {g.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{g.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 px-6 bg-green-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-green-200 uppercase tracking-widest mb-3">Why CarbonCalc</p>
            <h2 className="text-4xl font-extrabold mb-4">Built for real impact</h2>
            <p className="text-green-100 max-w-xl mx-auto">We designed every feature to make sustainability measurable, motivating, and accessible.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map(w => (
              <div key={w.title} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="text-3xl mb-4">{w.icon}</div>
                <h3 className="text-base font-bold mb-2">{w.title}</h3>
                <p className="text-sm text-green-100 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
                  {f.q}
                  <span className="text-green-500 text-xl ml-4 shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4 bg-gray-50">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🌱</div>
          <h2 className="text-4xl font-extrabold mb-4">Start your sustainability journey today</h2>
          <p className="text-green-100 mb-10 text-lg">Free to use. No credit card. Just you, your habits, and a greener future.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-10 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg text-base hover:-translate-y-0.5">
              Get Started Free →
            </Link>
            <Link to="/login" className="px-10 py-4 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white text-sm">🌿</div>
                <span className="text-white font-extrabold text-lg">CarbonCalc</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">Track and reduce your personal carbon footprint. Built for students, professionals, and eco-conscious individuals.</p>
              <p className="text-xs text-gray-600">support@carboncalc.app</p>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Product</p>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#goals" className="hover:text-white transition-colors">Our Goals</a></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Account</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-4">Legal</p>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors text-left">Privacy Policy</button></li>
                <li><span className="cursor-default">Terms of Service</span></li>
                <li><span className="cursor-default">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2025 CarbonCalc. All rights reserved.</p>
            <p>Made with 🌱 for a greener planet.</p>
          </div>
        </div>
      </footer>

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  )
}
