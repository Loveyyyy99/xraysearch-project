"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DISEASE_COLORS, SearchResult } from "@/lib/constants";

export type SavedCase = SearchResult & { savedAt: string; notes?: string };

export default function SavedCasesPage() {
  const [saved, setSaved] = useState<SavedCase[]>([]);
  const [selected, setSelected] = useState<SavedCase | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xray_saved_cases");
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  const remove = (image_id: string) => {
    const updated = saved.filter((c) => c.image_id !== image_id);
    setSaved(updated);
    localStorage.setItem("xray_saved_cases", JSON.stringify(updated));
    if (selected?.image_id === image_id) setSelected(null);
  };

  const saveNote = () => {
    if (!selected) return;
    const updated = saved.map((c) =>
      c.image_id === selected.image_id ? { ...c, notes: editingNote } : c
    );
    setSaved(updated);
    localStorage.setItem("xray_saved_cases", JSON.stringify(updated));
    setSelected({ ...selected, notes: editingNote });
  };

  const filtered = saved.filter(
    (c) =>
      c.patient_id.toLowerCase().includes(search.toLowerCase()) ||
      c.diagnoses.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

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
          <Link href="/dashboard" className="text-slate-500 hover:text-[#003fb1] transition-all">Dashboard</Link>
          <span className="text-[#003fb1] font-semibold border-b border-[#003fb1]">Saved Cases</span>
        </nav>
        <div className="w-9 h-9 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#003fb1] font-bold text-sm">DR</div>
      </header>

      {/* Sidebar */}
      <aside className="h-screen w-60 fixed left-0 top-0 pt-16 flex flex-col gap-1 px-3 py-4 border-r border-slate-200 bg-white z-40 hidden md:flex">
        <div className="px-3 mb-4 mt-2">
          <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest">Clinical Dashboard</p>
        </div>
        <nav className="flex flex-col gap-1">
          {[
            { icon: "search", label: "Search", href: "/dashboard" },
            { icon: "bookmark", label: "Saved Cases", href: "/saved", active: true },
            { icon: "history", label: "Recent", href: "/recent" },
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
          <p className="text-[9px] text-[#003fb1] font-label uppercase tracking-widest font-bold mb-1">Saved</p>
          <p className="text-xs font-bold text-[#003fb1]">{saved.length} cases</p>
        </div>
      </aside>

      {/* Main */}
      <main className="md:pl-60 pt-16 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-headline text-[#191c1e] mb-1">Saved Cases</h2>
              <p className="text-slate-500 text-sm">{saved.length} bookmarked · Click any case to add notes</p>
            </div>
            {saved.length > 0 && (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient or diagnosis..."
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003fb1]/20 focus:border-[#003fb1] w-64"
                />
              </div>
            )}
          </div>

          {saved.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-7xl text-slate-200 block mb-4">bookmark</span>
              <p className="text-slate-400 font-semibold text-lg">No saved cases yet</p>
              <p className="text-slate-300 text-sm mt-2">Go to the dashboard, search for X-rays, and bookmark cases you want to review later.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 mt-6 bg-[#003fb1] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1a56db] transition-all">
                <span className="material-symbols-outlined text-sm">search</span>
                Go to Search
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">search_off</span>
              <p className="text-slate-400">No cases match your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((c) => (
                <div
                  key={c.image_id}
                  onClick={() => { setSelected(c); setEditingNote(c.notes ?? ""); }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-[#003fb1]/20 transition-all group"
                >
                  <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-800 relative flex items-center justify-center">
                    {c.image_url ? (
                      <img src={c.image_url} alt="xray" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center opacity-20">
                        <span className="material-symbols-outlined text-white text-5xl block">radiology</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(c.image_id); }}
                        className="bg-white/10 hover:bg-red-500 text-white p-1.5 rounded-full transition-all"
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark_remove</span>
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 text-[9px] text-white/60 font-label uppercase tracking-widest">{c.view_position} View</div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-400 font-label font-bold uppercase tracking-widest">PATIENT: {c.patient_id}</p>
                      <span className="text-xs font-black text-[#003fb1]">{c.similarity.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3"><DiagBadges diagnoses={c.diagnoses} /></div>
                    <p className="text-xs text-slate-400">Age {c.age} · {c.gender === "M" ? "Male" : "Female"}</p>
                    {c.notes && (
                      <p className="text-xs text-[#003fb1] mt-2 bg-[#dbe1ff]/30 rounded-lg px-2 py-1 truncate">📝 {c.notes}</p>
                    )}
                    <p className="text-[10px] text-slate-300 mt-2">Saved {new Date(c.savedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#191c1e]">Patient {selected.patient_id}</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="h-44 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl mb-4 flex items-center justify-center">
              {selected.image_url ? (
                <img src={selected.image_url} alt="xray" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <span className="material-symbols-outlined text-white text-5xl opacity-20">radiology</span>
              )}
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-slate-500">Age</span><span className="font-bold">{selected.age}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Gender</span><span className="font-bold">{selected.gender === "M" ? "Male" : "Female"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">View</span><span className="font-bold">{selected.view_position}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Similarity</span><span className="font-bold text-[#003fb1]">{selected.similarity.toFixed(1)}%</span></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Diagnoses</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]"><DiagBadges diagnoses={selected.diagnoses} /></div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-label font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Clinical Notes</label>
              <textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Add your clinical notes here..."
                className="w-full bg-[#f2f4f7] rounded-xl p-3 text-sm resize-none h-20 focus:ring-2 focus:ring-[#003fb1]/20 focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={saveNote} className="flex-1 bg-[#003fb1] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#1a56db] transition-all">Save Note</button>
                <button onClick={() => { remove(selected.image_id); }} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all">Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
