"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DISEASE_COLORS, SearchResult } from "@/lib/constants";

export type RecentSearch = {
  id: string;
  fileName: string;
  timestamp: string;
  filters: { age?: string; gender?: string; diagnosis?: string; topK: number };
  results: SearchResult[];
  retrieval_ms: number;
};

export default function RecentPage() {
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xray_recent_searches");
      if (raw) setRecents(JSON.parse(raw));
    } catch {}
  }, []);

  const clearAll = () => {
    localStorage.removeItem("xray_recent_searches");
    setRecents([]);
    setExpanded(null);
  };

  const removeOne = (id: string) => {
    const updated = recents.filter((r) => r.id !== id);
    setRecents(updated);
    localStorage.setItem("xray_recent_searches", JSON.stringify(updated));
    if (expanded === id) setExpanded(null);
  };

  const DiagBadges = ({ diagnoses }: { diagnoses: string[] }) => (
    <>
      {diagnoses.map((d) => {
        const c = DISEASE_COLORS[d] ?? DISEASE_COLORS["No Finding"];
        return (
          <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.badge}`}>
            {d === "Pleural_Thickening" ? "Pleural Thick." : d}
          </span>
        );
      })}
    </>
  );

  return (
    <div className="bg-[#f7f9fc] min-h-screen text-[#191c1e]">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden material-symbols-outlined text-slate-600 p-1">menu</button>
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fb1] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
            <span className="text-xl font-bold font-headline text-[#003fb1]">XRaySearch</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6 items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-[#003fb1]">Home</Link>
          <Link href="/dashboard" className="text-slate-500 hover:text-[#003fb1]">Dashboard</Link>
          <span className="text-[#003fb1] font-semibold border-b border-[#003fb1]">Recent</span>
        </nav>
        <div className="w-9 h-9 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#003fb1] font-bold text-sm">DR</div>
      </header>

      <aside className="h-screen w-60 fixed left-0 top-0 pt-16 flex flex-col gap-1 px-3 py-4 border-r border-slate-200 bg-white z-40 hidden md:flex">
        <div className="px-3 mb-4 mt-2">
          <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">Clinical Dashboard</p>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { icon: "search", label: "Search", href: "/dashboard" },
            { icon: "bookmark", label: "Saved Cases", href: "/saved" },
            { icon: "history", label: "Recent", href: "/recent", active: true },
            { icon: "analytics", label: "Statistics", href: "/statistics" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${item.active ? "bg-[#003fb1]/5 text-[#003fb1] font-bold" : "text-slate-500 hover:text-[#003fb1] hover:bg-slate-50"}`}>
              <span className="material-symbols-outlined text-xl" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div className="h-px bg-slate-100 my-2" />
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-[#003fb1] hover:bg-slate-50 rounded-xl transition-all text-sm">
            <span className="material-symbols-outlined text-xl">home</span>
            Back to Home
          </Link>
        </nav>
        <div className="mt-auto mx-1 p-3 bg-[#dbe1ff]/30 rounded-xl">
          <p className="text-[9px] text-[#003fb1] font-label uppercase tracking-widest font-bold mb-1">History</p>
          <p className="text-xs font-bold text-[#003fb1]">{recents.length} searches</p>
        </div>
      </aside>

      <main className="md:pl-60 pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-headline text-[#191c1e] mb-1">Recent Searches</h2>
              <p className="text-slate-500 text-sm">Last {recents.length} searches · auto-saved from dashboard</p>
            </div>
            {recents.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center gap-1 transition-all">
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Clear All
              </button>
            )}
          </div>

          {recents.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-7xl text-slate-200 block mb-4">history</span>
              <p className="text-slate-400 font-semibold text-lg">No search history yet</p>
              <p className="text-slate-300 text-sm mt-2">Your searches will appear here automatically after you use the dashboard.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 mt-6 bg-[#003fb1] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1a56db] transition-all">
                <span className="material-symbols-outlined text-sm">search</span>
                Start Searching
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recents.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-all"
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <div className="w-10 h-10 bg-[#dbe1ff]/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#003fb1]">image_search</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#191c1e] truncate">{r.fileName}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400">{r.results.length} results · {r.retrieval_ms}ms</span>
                        {r.filters.diagnosis && (
                          <>
                            <span className="text-[10px] text-slate-300">·</span>
                            <span className="text-[10px] text-[#003fb1] font-bold">{r.filters.diagnosis}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeOne(r.id); }}
                        className="text-slate-300 hover:text-red-400 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                      <span className="material-symbols-outlined text-slate-400 text-sm transition-transform duration-200" style={{ transform: expanded === r.id ? "rotate(180deg)" : "rotate(0deg)" }}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {expanded === r.id && (
                    <div className="border-t border-slate-100 p-4">
                      {/* Filters used */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {r.filters.age && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">Age: {r.filters.age}</span>}
                        {r.filters.gender && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">Gender: {r.filters.gender === "M" ? "Male" : "Female"}</span>}
                        {r.filters.diagnosis && <span className="text-[10px] bg-[#dbe1ff] text-[#003fb1] px-2 py-1 rounded-lg font-bold">{r.filters.diagnosis}</span>}
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">Top {r.filters.topK}</span>
                      </div>
                      {/* Top 3 results */}
                      <p className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest mb-3">Top Results</p>
                      <div className="flex flex-col gap-2">
                        {r.results.slice(0, 3).map((res) => (
                          <div key={res.image_id} className="flex items-center gap-3 p-3 bg-[#f7f9fc] rounded-xl">
                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-slate-400 text-sm">radiology</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700">Patient {res.patient_id}</p>
                              <div className="flex flex-wrap gap-1 mt-0.5"><DiagBadges diagnoses={res.diagnoses} /></div>
                            </div>
                            <span className="text-sm font-black text-[#003fb1]">{res.similarity.toFixed(1)}%</span>
                          </div>
                        ))}
                        {r.results.length > 3 && (
                          <p className="text-[10px] text-slate-400 text-center py-1">+{r.results.length - 3} more results</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
