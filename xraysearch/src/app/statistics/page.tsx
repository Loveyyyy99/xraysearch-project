"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DISEASE_COLORS } from "@/lib/constants";
import type { RecentSearch } from "../recent/page";
import type { SavedCase } from "../saved/page";

export default function StatisticsPage() {
  const [recents, setRecents] = useState<RecentSearch[]>([]);
  const [saved, setSaved] = useState<SavedCase[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem("xray_recent_searches");
      const s = localStorage.getItem("xray_saved_cases");
      if (r) setRecents(JSON.parse(r));
      if (s) setSaved(JSON.parse(s));
    } catch {}
  }, []);

  // Compute stats
  const allResults = recents.flatMap((r) => r.results);
  const totalSearches = recents.length;
  const totalResults = allResults.length;
  const avgSimilarity = allResults.length > 0
    ? (allResults.reduce((sum, r) => sum + r.similarity, 0) / allResults.length).toFixed(1)
    : "—";
  const avgMs = recents.length > 0
    ? Math.round(recents.reduce((sum, r) => sum + r.retrieval_ms, 0) / recents.length)
    : 0;

  // Diagnosis frequency from all results
  const diagCount: Record<string, number> = {};
  allResults.forEach((r) => r.diagnoses.forEach((d) => { diagCount[d] = (diagCount[d] ?? 0) + 1; }));
  const diagSorted = Object.entries(diagCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxDiag = diagSorted[0]?.[1] ?? 1;

  // Gender split
  const maleCount = allResults.filter((r) => r.gender === "M").length;
  const femaleCount = allResults.filter((r) => r.gender === "F").length;
  const total = maleCount + femaleCount || 1;

  // Age distribution
  const ageBuckets: Record<string, number> = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81+": 0 };
  allResults.forEach((r) => {
    if (r.age <= 20) ageBuckets["0-20"]++;
    else if (r.age <= 40) ageBuckets["21-40"]++;
    else if (r.age <= 60) ageBuckets["41-60"]++;
    else if (r.age <= 80) ageBuckets["61-80"]++;
    else ageBuckets["81+"]++;
  });
  const maxAge = Math.max(...Object.values(ageBuckets), 1);

  // Similarity distribution buckets
  const simBuckets = { "95-100%": 0, "90-94%": 0, "85-89%": 0, "80-84%": 0, "<80%": 0 };
  allResults.forEach((r) => {
    if (r.similarity >= 95) simBuckets["95-100%"]++;
    else if (r.similarity >= 90) simBuckets["90-94%"]++;
    else if (r.similarity >= 85) simBuckets["85-89%"]++;
    else if (r.similarity >= 80) simBuckets["80-84%"]++;
    else simBuckets["<80%"]++;
  });
  const maxSim = Math.max(...Object.values(simBuckets), 1);

  const hasData = totalSearches > 0;

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
          <span className="text-[#003fb1] font-semibold border-b border-[#003fb1]">Statistics</span>
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
            { icon: "history", label: "Recent", href: "/recent" },
            { icon: "analytics", label: "Statistics", href: "/statistics", active: true },
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
      </aside>

      <main className="md:pl-60 pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-headline text-[#191c1e] mb-1">Statistics</h2>
            <p className="text-slate-500 text-sm">Aggregated from your search history · updates automatically</p>
          </div>

          {!hasData ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-7xl text-slate-200 block mb-4">analytics</span>
              <p className="text-slate-400 font-semibold text-lg">No data yet</p>
              <p className="text-slate-300 text-sm mt-2">Run some searches on the dashboard and your stats will appear here.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 mt-6 bg-[#003fb1] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1a56db] transition-all">
                <span className="material-symbols-outlined text-sm">search</span>
                Start Searching
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Searches", value: totalSearches, icon: "search", color: "text-[#003fb1]", bg: "bg-[#dbe1ff]/30" },
                  { label: "Cases Analysed", value: totalResults, icon: "image_search", color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Avg Similarity", value: `${avgSimilarity}%`, icon: "percent", color: "text-green-600", bg: "bg-green-50" },
                  { label: "Saved Cases", value: saved.length, icon: "bookmark", color: "text-amber-600", bg: "bg-amber-50" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <span className={`material-symbols-outlined ${kpi.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{kpi.icon}</span>
                    </div>
                    <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest mt-1">{kpi.label}</p>
                  </div>
                ))}
              </div>

              {/* Diagnosis frequency */}
              {diagSorted.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#191c1e] mb-1">Top Diagnoses in Results</h3>
                  <p className="text-[10px] text-slate-400 mb-5 font-label uppercase tracking-widest">Frequency across all search results</p>
                  <div className="space-y-3">
                    {diagSorted.map(([diag, count]) => {
                      const c = DISEASE_COLORS[diag] ?? DISEASE_COLORS["No Finding"];
                      const pct = Math.round((count / maxDiag) * 100);
                      return (
                        <div key={diag} className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-28 text-center flex-shrink-0 ${c.badge}`}>
                            {diag === "Pleural_Thickening" ? "Pleural Thick." : diag}
                          </span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#003fb1] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender split */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#191c1e] mb-1">Gender Distribution</h3>
                  <p className="text-[10px] text-slate-400 mb-5 font-label uppercase tracking-widest">Across all results</p>
                  <div className="flex items-end gap-6 justify-center">
                    {[
                      { label: "Male", count: maleCount, color: "bg-[#003fb1]", pct: Math.round((maleCount / total) * 100) },
                      { label: "Female", count: femaleCount, color: "bg-pink-400", pct: Math.round((femaleCount / total) * 100) },
                    ].map((g) => (
                      <div key={g.label} className="flex flex-col items-center gap-2">
                        <span className="text-lg font-black text-[#191c1e]">{g.pct}%</span>
                        <div className="w-16 bg-slate-100 rounded-t-xl overflow-hidden" style={{ height: 80 }}>
                          <div
                            className={`w-full ${g.color} rounded-t-xl transition-all duration-700`}
                            style={{ height: `${g.pct}%`, marginTop: `${100 - g.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 font-bold">{g.label}</span>
                        <span className="text-[10px] text-slate-300">{g.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age distribution */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#191c1e] mb-1">Age Distribution</h3>
                  <p className="text-[10px] text-slate-400 mb-5 font-label uppercase tracking-widest">Patient age groups</p>
                  <div className="space-y-2.5">
                    {Object.entries(ageBuckets).map(([bucket, count]) => (
                      <div key={bucket} className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 w-14 font-bold">{bucket}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${Math.round((count / maxAge) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Similarity score distribution */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-[#191c1e] mb-1">Similarity Score Distribution</h3>
                <p className="text-[10px] text-slate-400 mb-5 font-label uppercase tracking-widest">How well results matched your queries</p>
                <div className="flex items-end gap-3 h-28">
                  {Object.entries(simBuckets).map(([bucket, count]) => {
                    const pct = Math.round((count / maxSim) * 100);
                    const color = bucket === "95-100%" ? "bg-green-500" : bucket === "90-94%" ? "bg-green-400" : bucket === "85-89%" ? "bg-yellow-400" : bucket === "80-84%" ? "bg-orange-400" : "bg-red-400";
                    return (
                      <div key={bucket} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-slate-600">{count}</span>
                        <div className="w-full bg-slate-100 rounded-t-lg overflow-hidden" style={{ height: 72 }}>
                          <div
                            className={`w-full ${color} rounded-t-lg transition-all duration-700`}
                            style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 text-center leading-tight">{bucket}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Avg retrieval */}
              {avgMs > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#dbe1ff]/30 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#003fb1]" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#003fb1]">{avgMs}ms</p>
                    <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">Average HNSW retrieval time</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-slate-500">Across {totalSearches} searches</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">HNSW ANN · Rad-DINO embeddings</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
