"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      try {
        const raw = localStorage.getItem("xray_users");
        const users: Array<{ name: string; email: string; password: string }> = raw ? JSON.parse(raw) : [];
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) {
          setError("Invalid email or password.");
          setLoading(false);
          return;
        }
        localStorage.setItem("xray_current_user", JSON.stringify({ name: user.name, email: user.email }));
        router.push("/dashboard");
      } catch {
        setError("Something went wrong. Try again.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="bg-[#f7f9fc] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-[#003fb1]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-[#006780]/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,63,177,0.08)] p-8 md:p-12">
          <header className="text-center mb-10">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#003fb1] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
              <span className="text-2xl font-headline font-bold text-[#003fb1]">XRaySearch</span>
            </Link>
            <h1 className="text-3xl font-headline font-bold text-[#191c1e] mb-2">Welcome back</h1>
            <p className="text-[#434654] text-sm">Log in to your diagnostic search dashboard</p>
          </header>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-widest text-[#737686]" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="physician@hospital.com"
                  className="w-full px-4 py-3.5 bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-xl focus:ring-2 focus:ring-[#003fb1]/10 focus:border-[#003fb1] transition-all outline-none text-[#191c1e] placeholder:text-[#737686]/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]/40 text-xl">mail</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-widest text-[#737686]" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-xl focus:ring-2 focus:ring-[#003fb1]/10 focus:border-[#003fb1] transition-all outline-none text-[#191c1e] placeholder:text-[#737686]/40"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]/40 text-xl">
                  {showPw ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003fb1] hover:bg-[#1a56db] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#737686] mt-8">
            No account?{" "}
            <Link href="/signup" className="text-[#003fb1] font-bold hover:underline">
              Create one free
            </Link>
          </p>
          <p className="text-center text-xs text-slate-300 mt-3">
            Or{" "}
            <Link href="/dashboard" className="text-slate-400 hover:text-[#003fb1] underline">
              skip login and try the dashboard
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
