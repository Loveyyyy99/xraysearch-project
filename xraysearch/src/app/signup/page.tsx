"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getStrength(v: string) {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const map = [
    { w: "0%", color: "", label: "" },
    { w: "25%", color: "bg-red-400", label: "Weak" },
    { w: "50%", color: "bg-orange-400", label: "Fair" },
    { w: "75%", color: "bg-yellow-400", label: "Good" },
    { w: "100%", color: "bg-green-500", label: "Strong" },
  ];
  return map[score];
}

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strength = getStrength(password);

  const inputCls = "w-full px-4 py-3 bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-lg focus:border-[#003fb1] focus:ring-2 focus:ring-[#003fb1]/10 transition-all text-[#191c1e] outline-none placeholder:text-[#737686]/40 text-sm";
  const labelCls = "block text-xs font-label font-semibold text-[#434654] uppercase tracking-widest mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);

    setTimeout(() => {
      try {
        const raw = localStorage.getItem("xray_users");
        const users: Array<{ name: string; email: string; password: string }> = raw ? JSON.parse(raw) : [];
        if (users.find((u) => u.email === email)) {
          setError("An account with this email already exists.");
          setLoading(false);
          return;
        }
        users.push({ name, email, password });
        localStorage.setItem("xray_users", JSON.stringify(users));
        localStorage.setItem("xray_current_user", JSON.stringify({ name, email }));
        router.push("/dashboard");
      } catch {
        setError("Something went wrong. Try again.");
        setLoading(false);
      }
    }, 700);
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left brand panel */}
      <section className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-950 to-[#003fb1] flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
            <span className="text-2xl font-headline font-bold text-white">XRaySearch</span>
          </Link>
          <h2 className="text-4xl font-headline font-bold text-white leading-tight mb-4">
            The smarter way to search chest X-rays
          </h2>
          <p className="text-[#dbe1ff] text-sm leading-relaxed">
            Powered by Rad-DINO embeddings and HNSW vector search on the NIH ChestX-ray14 dataset.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {["4,999 indexed X-rays", "14 NIH pathology labels", "768-dim Rad-DINO embeddings", "HNSW ANN search"].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
              <span className="text-white/80 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Right form */}
      <section className="flex-1 flex items-center justify-center p-8 bg-[#f7f9fc]">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-[#003fb1] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
            <span className="text-2xl font-headline font-bold text-[#003fb1]">XRaySearch</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,63,177,0.06)]">
            <h1 className="text-2xl font-headline font-bold text-[#191c1e] mb-1">Create your account</h1>
            <p className="text-[#737686] text-sm mb-8">Free access to the diagnostic search dashboard</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jane Smith" className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="physician@hospital.com" className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters" className={inputCls}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]/50 text-xl">
                    {showPw ? "visibility_off" : "visibility"}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.w }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{strength.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showCpw ? "text" : "password"} required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password" className={inputCls}
                  />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#737686]/50 text-xl">
                    {showCpw ? "visibility_off" : "visibility"}
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
                type="submit" disabled={loading}
                className="w-full bg-[#003fb1] hover:bg-[#1a56db] disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-[#737686] mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#003fb1] font-bold hover:underline">Log in</Link>
            </p>
            <p className="text-center text-xs text-slate-300 mt-2">
              Or{" "}
              <Link href="/dashboard" className="text-slate-400 hover:text-[#003fb1] underline">skip and try the dashboard</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
