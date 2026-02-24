/**
 * Shared layout wrapper for all auth pages.
 * Provides a green nature-themed background with subtle decorations.
 */
export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #d4edda 0%, #b8e6c8 30%, #8fd4a4 60%, #6dc08a 100%)",
      }}
    >
      {/* Subtle blurred background accents + decorative leaves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        {/* Leaf top-right */}
        <svg className="absolute -right-6 top-8 w-[280px] h-[280px] opacity-[0.08] rotate-[10deg]" viewBox="0 0 120 120" fill="none">
          <path d="M60 10 C40 15, 15 35, 12 65 C10 85, 25 105, 55 108 C65 109, 75 100, 85 85 C100 60, 95 30, 60 10Z" fill="#22a34a"/>
          <path d="M55 108 L48 118" stroke="#1a6e30" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M55 108 C50 85, 48 60, 60 20" stroke="#1a6e30" strokeWidth="1.8" fill="none"/>
          <path d="M50 75 C40 68, 28 70, 18 62" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M48 58 C38 52, 28 52, 22 45" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M55 80 C65 75, 78 78, 88 72" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M52 65 C62 58, 75 58, 85 50" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M54 48 C62 42, 72 40, 82 34" stroke="#1a6e30" strokeWidth="1" fill="none"/>
        </svg>
        {/* Leaf bottom-left */}
        <svg className="absolute -left-8 bottom-12 w-[200px] h-[200px] opacity-[0.07] rotate-[160deg]" viewBox="0 0 120 120" fill="none">
          <path d="M60 10 C40 15, 15 35, 12 65 C10 85, 25 105, 55 108 C65 109, 75 100, 85 85 C100 60, 95 30, 60 10Z" fill="#22a34a"/>
          <path d="M55 108 L48 118" stroke="#1a6e30" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M55 108 C50 85, 48 60, 60 20" stroke="#1a6e30" strokeWidth="1.8" fill="none"/>
          <path d="M50 75 C40 68, 28 70, 18 62" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M55 80 C65 75, 78 78, 88 72" stroke="#1a6e30" strokeWidth="1" fill="none"/>
          <path d="M52 65 C62 58, 75 58, 85 50" stroke="#1a6e30" strokeWidth="1" fill="none"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}
