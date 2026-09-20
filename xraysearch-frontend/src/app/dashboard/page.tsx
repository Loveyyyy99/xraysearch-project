"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { DISEASE_COLORS, SearchResult, SearchResponse } from "@/lib/constants";
import { searchSimilarXrays } from "@/lib/api";

const DIAGNOSES = [
  "Atelectasis","Cardiomegaly","Consolidation","Edema","Effusion",
  "Emphysema","Fibrosis","Hernia","Infiltration","Mass","Nodule",
  "Pleural_Thickening","Pneumonia","Pneumothorax","No Finding",
];

type View = "grid" | "list";
type SortBy = "similarity" | "age";

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [topK, setTopK] = useState("6");
  const [view, setView] = useState<View>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("similarity");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<{ ms: number; cohort: number; total: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SearchResult | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xray_saved_cases");
      if (raw) {
        const cases = JSON.parse(raw) as Array<{ image_id: string }>;
        setSavedIds(new Set(cases.map((c) => c.image_id)));
      }
    } catch {}
  }, []);

  const toggleSave = (r: SearchResult) => {
    const raw = localStorage.getItem("xray_saved_cases");
    const cases: Array<SearchResult & { savedAt: string; notes?: string }> = raw ? JSON.parse(raw) : [];
    const exists = cases.find((c) => c.image_id === r.image_id);
    let updated;
    if (exists) {
      updated = cases.filter((c) => c.image_id !== r.image_id);
    } else {
      updated = [{ ...r, savedAt: new Date().toISOString() }, ...cases];
    }
    localStorage.setItem("xray_saved_cases", JSON.stringify(updated));
    setSavedIds(new Set(updated.map((c) => c.image_id)));
  };
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/) && !file.name.endsWith(".dcm")) {
      alert("Please upload a DICOM, PNG, or JPG file.");
      return;
    }
    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearFile = () => {
    setUploadedFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const runSearch = async () => {
    if (!uploadedFile) {
      alert("Please upload a chest X-ray first.");
      return;
    }
    setStatus("loading");
    setResults([]);
    setStats(null);
    setErrorMsg("");
    try {
      const data: SearchResponse = await searchSimilarXrays({
        file: uploadedFile,
        age_group: age || undefined,
        gender: gender || undefined,
        diagnosis: diagnosis || undefined,
        top_k: parseInt(topK),
      });
      setResults(data.results);
      setStats({ ms: data.retrieval_ms, cohort: data.pre_filter_count, total: data.total_indexed });
      setStatus("done");
      // Save to recent searches
      try {
        const entry = {
          id: Date.now().toString(),
          fileName: uploadedFile.name,
          timestamp: new Date().toISOString(),
          filters: { age: age || undefined, gender: gender || undefined, diagnosis: diagnosis || undefined, topK: parseInt(topK) },
          results: data.results,
          retrieval_ms: data.retrieval_ms,
        };
        const raw = localStorage.getItem("xray_recent_searches");
        const existing = raw ? JSON.parse(raw) : [];
        const updated = [entry, ...existing].slice(0, 20);
        localStorage.setItem("xray_recent_searches", JSON.stringify(updated));
      } catch {}
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Search failed";
      setErrorMsg(msg);
      setStatus("error");
    }
  };

  const sorted = [...results].sort((a, b) =>
    sortBy === "age" ? a.age - b.age : b.similarity - a.similarity
  );

  const simColor = (s: number) =>
    s >= 90 ? "bg-green-500" : s >= 80 ? "bg-yellow-500" : "bg-orange-400";

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
    <div className="bg-[#f7f9fc] min-h-screen text-[#191c1e] overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden material-symbols-outlined text-slate-600 p-1">menu</button>
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003fb1] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>radiology</span>
            <span className="text-xl font-bold font-headline text-[#003fb1]">XRaySearch</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6 items-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-[#003fb1] transition-all">Home</Link>
          <span className="text-[#003fb1] font-semibold border-b border-[#003fb1]">Dashboard</span>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#f2f4f7] px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] text-[#737686] font-label uppercase tracking-wider">HNSW Online</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#003fb1] font-bold text-sm">DR</div>
        </div>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className="h-screen w-60 fixed left-0 top-0 pt-16 flex flex-col gap-1 px-3 py-4 border-r border-slate-200 bg-white z-40 hidden md:flex">
        <div className="px-3 mb-4 mt-2">
          <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">Clinical Dashboard</p>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { icon: "search", label: "Search", active: true },
            { icon: "bookmark", label: "Saved Cases", href: "/saved" },
            { icon: "history", label: "Recent", href: "/recent" },
            { icon: "analytics", label: "Statistics", href: "/statistics" },
          ].map((item) => (
            <Link key={item.label} href={(item as {href?: string}).href ?? "#"} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${item.active ? "bg-[#003fb1]/5 text-[#003fb1] font-bold" : "text-slate-500 hover:text-[#003fb1] hover:bg-slate-50"}`}>
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
          <p className="text-[9px] text-[#003fb1] font-label uppercase tracking-widest font-bold mb-1">NIH Dataset</p>
          <p className="text-xs font-bold text-[#003fb1]">4,999 images</p>
          <p className="text-[10px] text-[#737686]">14 pathology labels</p>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside className={`h-screen w-64 fixed left-0 top-0 pt-16 flex flex-col gap-1 px-3 py-4 border-r border-slate-200 bg-white z-50 md:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <nav className="flex flex-col gap-1 mt-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-[#003fb1]/5 text-[#003fb1] font-bold rounded-xl text-sm">
            <span className="material-symbols-outlined">search</span>Search
          </a>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-[#003fb1] rounded-xl text-sm">
            <span className="material-symbols-outlined">home</span>Back to Home
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="md:pl-60 xl:pr-72 pt-16 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-8">
          <header className="mb-8">
            <h2 className="text-3xl font-headline text-[#191c1e] mb-1">Diagnostic Search</h2>
            <p className="text-slate-500 text-sm">Semantic visual retrieval · NIH ChestX-ray14 · HNSW ANN Index</p>
          </header>

          {/* Upload & Filter Panel */}
          <section className="bg-white rounded-2xl p-6 shadow-ambient mb-6 border border-slate-100">
            <label
              htmlFor="xray-upload"
              className={`upload-zone border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center bg-[#f2f4f7]/20 mb-6 cursor-pointer ${isDragging ? "drag-over border-[#003fb1] bg-[#003fb1]/4" : "border-[#c3c5d7]/40"}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <span className="material-symbols-outlined text-5xl text-[#003fb1] mb-3">
                {uploadedFile ? "task_alt" : "cloud_upload"}
              </span>
              <p className="text-base font-semibold text-slate-700">
                {uploadedFile ? "File ready — click Search to retrieve" : "Drag & drop a chest X-ray or click to browse"}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-label uppercase tracking-tight">DICOM · PNG · JPG · Max 25MB</p>
              <input id="xray-upload" ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.dcm" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>

            {uploadedFile && (
              <div className="mb-6 flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                {preview && <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-green-300" />}
                <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-800 text-sm truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-green-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · Ready for embedding</p>
                </div>
                <button onClick={clearFile} className="text-green-600 hover:text-red-600 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest">Age Group</label>
                <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-[#003fb1]/20 focus:border-[#003fb1] transition-all">
                  <option value="">Any Age</option>
                  <option value="0-20">0 – 20 (Pediatric)</option>
                  <option value="21-40">21 – 40 (Young Adult)</option>
                  <option value="41-60">41 – 60 (Middle-aged)</option>
                  <option value="61-80">61 – 80 (Senior)</option>
                  <option value="81+">81+ (Elderly)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-[#003fb1]/20 focus:border-[#003fb1] transition-all">
                  <option value="">Any</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest">Primary Diagnosis</label>
                <select value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-[#003fb1]/20 focus:border-[#003fb1] transition-all">
                  <option value="">All Conditions</option>
                  {DIAGNOSES.map((d) => <option key={d} value={d}>{d === "Pleural_Thickening" ? "Pleural Thickening" : d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest">Top-K Results</label>
                <select value={topK} onChange={(e) => setTopK(e.target.value)} className="w-full bg-[#f2f4f7] border border-[#c3c5d7]/30 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-[#003fb1]/20 focus:border-[#003fb1] transition-all">
                  <option value="6">Top 6</option>
                  <option value="10">Top 10</option>
                  <option value="20">Top 20</option>
                  <option value="50">Top 50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex gap-2">
                {(["grid","list"] as View[]).map((v) => (
                  <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${view === v ? "bg-[#003fb1]/10 text-[#003fb1]" : "bg-[#f2f4f7] text-slate-500 hover:bg-slate-100"}`}>
                    <span className="material-symbols-outlined text-sm">{v === "grid" ? "grid_view" : "view_list"}</span>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <button onClick={runSearch} disabled={status === "loading"} className="bg-[#003fb1] hover:bg-[#1a56db] disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#003fb1]/20 text-sm whitespace-nowrap">
                <span className="material-symbols-outlined">{status === "loading" ? "hourglass_empty" : "search"}</span>
                {status === "loading" ? "Searching…" : "Search Similar Cases"}
              </button>
            </div>
          </section>

          {/* Results header */}
          {status === "done" && results.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-headline text-[#191c1e]">Matched Visual Candidates</h3>
                <p className="text-xs text-slate-400 font-label mt-0.5">
                  {results.length} results · {stats?.ms}ms retrieval · {stats?.cohort} pre-filter cohort
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-label uppercase">Sort:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} className="bg-transparent border-none text-[#003fb1] font-bold text-xs py-0 focus:ring-0 cursor-pointer">
                  <option value="similarity">Similarity</option>
                  <option value="age">Age</option>
                </select>
              </div>
            </div>
          )}

          {/* Loading */}
          {status === "loading" && (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-[#dbe1ff] rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#003fb1] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-semibold">Running HNSW vector search…</p>
                <p className="text-xs text-[#737686] font-label uppercase tracking-widest">SQLite pre-filter → embedding → ANN retrieval</p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">error_outline</span>
              <p className="text-slate-600 font-semibold">Search failed</p>
              <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
              <p className="text-xs text-slate-400 mt-2">Make sure your FastAPI backend is running and CORS is enabled.</p>
            </div>
          )}

          {/* Empty state */}
          {status === "idle" && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-[#737686]/30 mb-4 block">image_search</span>
              <p className="text-slate-400 font-semibold">Upload a chest X-ray and apply filters to begin</p>
              <p className="text-xs text-slate-300 mt-2">Supports NIH ChestX-ray14 format · 14 pathology classes · HNSW ANN Search</p>
            </div>
          )}

          {/* Results */}
          {status === "done" && (
            <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10" : "flex flex-col gap-3 mb-10"}>
              {sorted.map((r) => {
                const sc = simColor(r.similarity);
                return view === "list" ? (
                  <div key={r.image_id} className="result-card bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-5">
                    {r.image_url ? (
                      <img src={r.image_url} alt="xray" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-900" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-900 flex-shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-2xl">radiology</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-slate-700 font-label uppercase">PATIENT: {r.patient_id}</p>
                        <span className="text-[10px] text-slate-400">{r.view_position} View</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2"><DiagBadges diagnoses={r.diagnoses} /></div>
                      <p className="text-xs text-slate-500">Age: <strong>{r.age}</strong> · Gender: <strong>{r.gender === "M" ? "Male" : "Female"}</strong></p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xl font-black text-[#003fb1]">{r.similarity.toFixed(1)}%</div>
                      <div className="text-[10px] text-[#737686] font-label uppercase">Match</div>
                    </div>
                  </div>
                ) : (
                  <div key={r.image_id} className="result-card bg-white rounded-2xl overflow-hidden shadow-ambient border border-slate-50">
                    <div className="h-44 bg-gradient-to-br from-slate-900 to-slate-800 relative flex items-center justify-center">
                      {r.image_url ? (
                        <img src={r.image_url} alt="xray" className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-center opacity-20">
                          <span className="material-symbols-outlined text-white text-5xl block mb-1">radiology</span>
                          <span className="text-white text-xs font-label uppercase tracking-widest">Chest X-Ray · {r.view_position}</span>
                        </div>
                      )}
                      <div className={`absolute top-3 right-3 flex items-center gap-1 ${sc} text-white text-[10px] font-bold px-2.5 py-1 rounded-full`}>
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        {r.similarity.toFixed(1)}% MATCH
                      </div>
                      <div className="absolute top-3 left-3 text-[9px] text-white/50 font-label uppercase tracking-widest">{r.view_position} View</div>
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] text-slate-400 font-label font-bold uppercase tracking-widest mb-2">PATIENT: {r.patient_id}</p>
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
                        <span>Age: <strong>{r.age}</strong></span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Gender: <strong>{r.gender === "M" ? "Male" : "Female"}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4"><DiagBadges diagnoses={r.diagnoses} /></div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => setSelectedCase(r)} className="text-[#003fb1] font-bold text-xs flex items-center gap-1 hover:gap-2 transition-all">
                          View Full Case <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(r); }}
                          className={`p-1.5 rounded-lg transition-all ${savedIds.has(r.image_id) ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-400 hover:bg-amber-50"}`}
                          title={savedIds.has(r.image_id) ? "Remove from saved" : "Save case"}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: savedIds.has(r.image_id) ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Right sidebar */}
      <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white border-l border-slate-100 p-5 z-30 hidden xl:flex flex-col gap-5 overflow-y-auto">
        <section className="bg-[#f2f4f7] rounded-xl p-5">
          <h4 className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-4">Search Stats</h4>
          <div className="space-y-3">
            {[
              ["Retrieval time", stats ? `${stats.ms}ms` : "—"],
              ["Results found", stats ? String(results.length) : "—"],
              ["Pre-filter cohort", stats ? String(stats.cohort) : "—"],
              ["Index size", "4,999"],
              ["Embedding dims", "768"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-bold text-[#003fb1]">{val}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h4 className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest mb-3">NIH Pathologies (14)</h4>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DISEASE_COLORS).filter(([k]) => k !== "No Finding").map(([d, c]) => (
              <span key={d} className={`text-[10px] px-2 py-0.5 rounded font-bold ${c.badge}`}>
                {d === "Pleural_Thickening" ? "Pleural Thick." : d}
              </span>
            ))}
          </div>
        </section>
        <div className="mt-auto p-4 rounded-xl bg-[#ffdbcf]/20 border border-[#ffdbcf]/40">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[#852b00] text-lg">info</span>
            <div>
              <p className="text-[11px] font-bold text-[#380d00] mb-1">Curator Tip</p>
              <p className="text-[10px] text-[#852b00] leading-relaxed">
                Similarity scores use cosine distance on 768-dim Rad-DINO embeddings (Microsoft), trained specifically on chest X-rays. Review 85%+ matches first for differential diagnosis support.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Full Case Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCase(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#191c1e]">Full Case — Patient {selectedCase.patient_id}</h3>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="h-48 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl mb-4 flex items-center justify-center">
              {selectedCase.image_url ? (
                <img src={selectedCase.image_url} alt="xray" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <div className="text-center opacity-30">
                  <span className="material-symbols-outlined text-white text-5xl block">radiology</span>
                  <span className="text-white text-xs">No image URL configured</span>
                </div>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Patient ID</span><span className="font-bold">{selectedCase.patient_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Age</span><span className="font-bold">{selectedCase.age}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Gender</span><span className="font-bold">{selectedCase.gender === "M" ? "Male" : "Female"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">View Position</span><span className="font-bold">{selectedCase.view_position}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Similarity</span><span className="font-bold text-[#003fb1]">{selectedCase.similarity.toFixed(1)}%</span></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Diagnoses</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]"><DiagBadges diagnoses={selectedCase.diagnoses} /></div>
              </div>
              <div className="flex justify-between"><span className="text-slate-500">Image ID</span><span className="font-mono text-xs text-slate-600">{selectedCase.image_id}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
