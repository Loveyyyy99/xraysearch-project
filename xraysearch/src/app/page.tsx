import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DISEASES } from "@/lib/constants";

const DISEASE_ICON_COLORS: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-600 text-blue-800 text-blue-500",
  red: "bg-red-50 border-red-200 text-red-600 text-red-800 text-red-500",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-600 text-cyan-800 text-cyan-500",
  orange: "bg-orange-50 border-orange-200 text-orange-600 text-orange-800 text-orange-500",
  purple: "bg-purple-50 border-purple-200 text-purple-600 text-purple-800 text-purple-500",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-600 text-indigo-800 text-indigo-500",
  green: "bg-green-50 border-green-200 text-green-600 text-green-800 text-green-500",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-600 text-yellow-800 text-yellow-500",
  teal: "bg-teal-50 border-teal-200 text-teal-600 text-teal-800 text-teal-500",
  pink: "bg-pink-50 border-pink-200 text-pink-600 text-pink-800 text-pink-500",
  lime: "bg-lime-50 border-lime-200 text-lime-600 text-lime-800 text-lime-500",
  amber: "bg-amber-50 border-amber-200 text-amber-600 text-amber-800 text-amber-500",
  violet: "bg-violet-50 border-violet-200 text-violet-600 text-violet-800 text-violet-500",
  rose: "bg-rose-50 border-rose-200 text-rose-600 text-rose-800 text-rose-500",
};

export default function HomePage() {
  return (
    <div className="bg-[#f7f9fc] min-h-screen">
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#dbe1ff]/50 text-[#003fb1] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-[#003fb1] rounded-full animate-pulse"></span>
              NIH ChestX-ray14 Dataset · 5,606 Images · 14 Pathologies
            </div>
            <h1 className="text-6xl md:text-7xl font-headline font-bold leading-tight tracking-tight text-[#191c1e]">
              Find Similar <span className="text-[#003fb1]">X-Rays</span> Instantly
            </h1>
            <p className="text-xl text-[#737686] leading-relaxed max-w-xl">
              Upload a chest X-ray and retrieve the most visually similar cases from our indexed database — powered by Google CXR ViT embeddings and HNSW vector search, filtered by age, gender, and diagnosis.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="bg-[#003fb1] text-white px-8 py-4 rounded-xl font-bold shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 group"
              >
                Try Dashboard
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link
                href="/signup"
                className="border-2 border-[#c3c5d7] text-[#003fb1] px-8 py-4 rounded-xl font-bold hover:bg-[#f2f4f7] transition-all duration-300"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-[#003fb1]/5 rounded-3xl blur-3xl group-hover:bg-[#003fb1]/10 transition-all duration-700"></div>
            <div className="relative bg-white p-6 rounded-3xl border border-[#c3c5d7]/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6 border-b border-[#f2f4f7] pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="text-xs font-label uppercase tracking-widest text-[#737686]">Semantic Search Interface</div>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#c3c5d7]/40 rounded-xl p-6 flex flex-col items-center justify-center bg-[#f2f4f7]/50">
                  <span className="material-symbols-outlined text-4xl text-[#003fb1] mb-2">cloud_upload</span>
                  <span className="text-sm font-semibold text-[#191c1e]">Drop chest X-ray here</span>
                  <span className="text-xs text-[#737686] mt-1">DICOM · PNG · JPG · Max 25MB</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[["Age Group","41–60"],["Gender","Any"],["Diagnosis","Pneumonia"]].map(([label, val]) => (
                    <div key={label} className="bg-[#f2f4f7] rounded-lg p-2">
                      <div className="text-[9px] text-[#737686] uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-xs font-bold text-[#003fb1]">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-[#f2f4f7] rounded-xl px-4 py-3">
                  <span className="text-xs text-[#737686]">Top Results</span>
                  <div className="flex gap-2">
                    {["98%","94%","91%"].map((s, i) => (
                      <span key={i} className="text-white text-[10px] font-bold px-2 py-1 rounded" style={{ backgroundColor: `rgba(0,63,177,${1 - i * 0.25})` }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-[#737686] font-label uppercase tracking-widest">
                    Retrieval via HNSW ANN · &lt;500ms · Google CXR ViT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-[#eceef1] py-16">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {[
                ["5,606","X-rays in database"],
                ["<500ms","HNSW retrieval"],
                ["14","NIH pathologies"],
                ["2048","ViT embedding dims"],
                ["99%+","Recall@10"],
              ].map(([val, label]) => (
                <div key={label} className="text-center space-y-2">
                  <div className="text-4xl font-headline font-black text-[#003fb1]">{val}</div>
                  <div className="text-xs font-label uppercase tracking-widest text-[#737686]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 14 Diseases */}
        <section id="diseases" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-headline font-bold mb-4">14 NIH Chest Pathologies</h2>
              <p className="text-[#737686] max-w-2xl mx-auto">
                Our system is trained on the NIH ChestX-ray14 benchmark — covering all 14 labeled thoracic disease categories with patient metadata.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {DISEASES.map((d) => {
                const c = d.color;
                return (
                  <div
                    key={d.name}
                    className={`disease-chip border rounded-xl p-4 text-center hover:shadow-md bg-${c}-50 border-${c}-200`}
                  >
                    <span className={`material-symbols-outlined text-${c}-600 text-2xl mb-2 block`}>{d.icon}</span>
                    <div className={`text-xs font-bold text-${c}-800`}>{d.name === "Pleural_Thickening" ? "Pleural Thick." : d.name}</div>
                    <div className={`text-[10px] text-${c}-500 mt-1`}>{d.desc}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <span className="text-xs text-[#737686] font-label uppercase tracking-widest">
                Source: NIH ChestX-ray14 — Wang et al., 2017 · 112,000+ frontal X-rays with multi-label annotations
              </span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-[#f2f4f7] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-headline font-bold mb-4">How XRaySearch Works</h2>
              <p className="text-[#737686] max-w-2xl mx-auto">
                A two-stage hybrid retrieval pipeline combining metadata pre-filtering with HNSW vector search.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: "1", title: "Upload X-Ray",
                  desc: "Upload a chest X-ray (DICOM/PNG/JPG). The Google CXR Vision Transformer encodes it into a 2048-dimensional semantic embedding vector.",
                },
                {
                  step: "2", title: "Filter & Pre-screen",
                  desc: "Select age group, gender, and up to 14 NIH diagnosis labels. SQLite pre-filters the 5,606-image corpus to a relevant patient cohort before vector search.",
                },
                {
                  step: "3", title: "Retrieve & Review",
                  desc: "HNSW Approximate Nearest Neighbour search returns Top-K visually similar cases in <500ms, ranked by cosine similarity with full patient metadata.",
                },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center text-center group bg-white rounded-2xl p-8 shadow-sm hover:-translate-y-2 transition-all">
                  <div className="w-16 h-16 rounded-full bg-[#003fb1] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-[#737686] text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#737686] text-center mb-6">Technology Stack</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  ["Google CXR ViT", "Embedding model · 2048-dim"],
                  ["hnswlib", "ANN vector search"],
                  ["SQLite", "Metadata pre-filter"],
                  ["FastAPI", "REST backend"],
                ].map(([name, sub]) => (
                  <div key={name} className="p-4 bg-[#f2f4f7] rounded-xl">
                    <div className="font-bold text-[#003fb1] text-sm">{name}</div>
                    <div className="text-xs text-[#737686] mt-1">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* For Users */}
        <section id="for-users" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-headline font-bold mb-4">Built for the Healthcare Ecosystem</h2>
              <p className="text-[#737686] max-w-xl mx-auto">From frontline clinicians to medical students and researchers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "clinical_notes", title: "Radiologists",
                  desc: "Instantly compare ambiguous findings against thousands of confirmed historical cases. Reduce diagnostic uncertainty on rare pathologies.",
                  features: ["Case Comparison","Differential Diagnosis Support","14-label Pathology Filter"],
                  accent: "text-[#006780]", iconBg: "bg-[#b7eaff]",
                },
                {
                  icon: "science", title: "Researchers",
                  desc: "Aggregate visually similar cohorts across 5,606 NIH images. Study disease co-occurrence patterns filtered by age and gender demographics.",
                  features: ["Cohort Discovery","Multi-label Metadata Export","Patient ID Lookup"],
                  accent: "text-[#852b00]", iconBg: "bg-[#ffdbcf]",
                },
                {
                  icon: "school", title: "Medical Students",
                  desc: "Build visual intuition faster with an interactive digital atlas. Explore how the same pathology looks across different patient demographics.",
                  features: ["Visual Learning Atlas","Similarity-ranked Review","Age/Gender Demographic Filters"],
                  accent: "text-[#003fb1]", iconBg: "bg-[#dbe1ff]",
                },
              ].map((u) => (
                <div key={u.title} className="bg-white p-8 rounded-3xl border border-[#c3c5d7]/10 hover:-translate-y-2 transition-all duration-300 shadow-sm">
                  <div className={`w-12 h-12 ${u.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                    <span className="material-symbols-outlined">{u.icon}</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold mb-4">{u.title}</h3>
                  <p className="text-[#737686] text-sm leading-relaxed mb-4">{u.desc}</p>
                  <ul className="space-y-2">
                    {u.features.map((f) => (
                      <li key={f} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${u.accent}`}>
                        <span className="material-symbols-outlined text-sm">check_circle</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#003fb1]">
          <div className="max-w-4xl mx-auto px-8 text-center text-white space-y-8">
            <h2 className="text-5xl font-headline font-bold">Ready to search smarter?</h2>
            <p className="text-[#dbe1ff] text-xl">
              Built for radiologists, researchers, and medical trainees who need fast, intelligent visual retrieval.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard" className="bg-white text-[#003fb1] px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined">search</span>
                Try Dashboard
              </Link>
              <Link href="/signup" className="border-2 border-white/50 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 px-8 bg-[#eceef1] border-t border-[#c3c5d7]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003fb1] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
              <span className="text-2xl font-headline font-black text-slate-900">XRaySearch</span>
            </div>
            <p className="text-sm text-[#737686] leading-relaxed">
              Semantic X-ray retrieval using deep learning. NIH ChestX-ray14 · 14 pathologies · HNSW ANN search.
            </p>
            <p className="text-xs text-[#737686]">Personal Research Project · 2025</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-label uppercase tracking-widest text-[#003fb1] font-bold">Platform</h4>
            <nav className="flex flex-col gap-3">
              {[["Home","/"],["Dashboard","/dashboard"],["How It Works","/#how-it-works"],["14 Conditions","/#diseases"]].map(([label, href]) => (
                <Link key={href} href={href} className="text-xs uppercase tracking-widest text-slate-500 hover:text-[#003fb1] transition-colors">{label}</Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-label uppercase tracking-widest text-[#003fb1] font-bold">Account</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/signup" className="text-xs uppercase tracking-widest text-slate-500 hover:text-[#003fb1] transition-colors">Sign Up</Link>
              <Link href="/login" className="text-xs uppercase tracking-widest text-slate-500 hover:text-[#003fb1] transition-colors">Log In</Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-label uppercase tracking-widest text-[#003fb1] font-bold">Dataset</h4>
            <p className="text-xs text-[#737686] leading-relaxed">
              NIH ChestX-ray14<br />Wang et al., 2017<br />112,120 frontal X-rays<br />14 disease labels<br />5,606 subset used
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#c3c5d7]/10 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#737686]">
            © 2025 XRaySearch · For Research & Educational Use Only · Not a Clinical Diagnostic Device
          </p>
        </div>
      </footer>
    </div>
  );
}
