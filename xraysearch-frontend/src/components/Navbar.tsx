"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 border-b border-slate-200/50 glass-nav shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#003fb1] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          radiology
        </span>
        <span className="text-2xl font-bold font-headline text-[#003fb1]">XRaySearch</span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className={`py-1 transition-all ${path === "/" ? "text-[#003fb1] font-semibold border-b-2 border-[#003fb1]" : "text-slate-600 hover:text-[#003fb1]"}`}>
          Home
        </Link>
        <Link href="/#how-it-works" className="text-slate-600 hover:text-[#003fb1] transition-all py-1">
          How It Works
        </Link>
        <Link href="/#for-users" className="text-slate-600 hover:text-[#003fb1] transition-all py-1">
          For Clinicians
        </Link>
        <Link href="/#diseases" className="text-slate-600 hover:text-[#003fb1] transition-all py-1">
          Conditions
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="bg-[#003fb1] hover:bg-[#1a56db] text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-300">
          Try Dashboard
        </Link>
      </div>
    </nav>
  );
}
