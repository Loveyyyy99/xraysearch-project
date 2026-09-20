export const DISEASES = [
  { name: "Atelectasis", desc: "Lung collapse", icon: "air", color: "blue" },
  { name: "Cardiomegaly", desc: "Enlarged heart", icon: "favorite", color: "red" },
  { name: "Effusion", desc: "Fluid buildup", icon: "water_drop", color: "cyan" },
  { name: "Infiltration", desc: "Lung infiltrate", icon: "blur_on", color: "orange" },
  { name: "Mass", desc: "Lung mass", icon: "adjust", color: "purple" },
  { name: "Nodule", desc: "Small nodule", icon: "radio_button_checked", color: "indigo" },
  { name: "Pneumonia", desc: "Lung infection", icon: "coronavirus", color: "green" },
  { name: "Pneumothorax", desc: "Collapsed lung", icon: "compress", color: "yellow" },
  { name: "Consolidation", desc: "Solid lung area", icon: "merge", color: "teal" },
  { name: "Edema", desc: "Fluid in lungs", icon: "zoom_out_map", color: "pink" },
  { name: "Emphysema", desc: "Air trapping", icon: "bubble_chart", color: "lime" },
  { name: "Fibrosis", desc: "Scar tissue", icon: "texture", color: "amber" },
  { name: "Pleural_Thickening", desc: "Pleural scarring", icon: "account_tree", color: "violet" },
  { name: "Hernia", desc: "Diaphragmatic", icon: "broken_image", color: "rose" },
] as const;

export const DISEASE_COLORS: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  Atelectasis:       { bg: "bg-blue-50",   text: "text-blue-800",   badge: "bg-blue-100 text-blue-800",   border: "border-blue-200" },
  Cardiomegaly:      { bg: "bg-red-50",    text: "text-red-800",    badge: "bg-red-100 text-red-800",     border: "border-red-200" },
  Effusion:          { bg: "bg-cyan-50",   text: "text-cyan-800",   badge: "bg-cyan-100 text-cyan-800",   border: "border-cyan-200" },
  Infiltration:      { bg: "bg-orange-50", text: "text-orange-800", badge: "bg-orange-100 text-orange-800", border: "border-orange-200" },
  Mass:              { bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-100 text-purple-800", border: "border-purple-200" },
  Nodule:            { bg: "bg-indigo-50", text: "text-indigo-800", badge: "bg-indigo-100 text-indigo-800", border: "border-indigo-200" },
  Pneumonia:         { bg: "bg-green-50",  text: "text-green-800",  badge: "bg-green-100 text-green-800",  border: "border-green-200" },
  Pneumothorax:      { bg: "bg-yellow-50", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800", border: "border-yellow-200" },
  Consolidation:     { bg: "bg-teal-50",   text: "text-teal-800",   badge: "bg-teal-100 text-teal-800",   border: "border-teal-200" },
  Edema:             { bg: "bg-pink-50",   text: "text-pink-800",   badge: "bg-pink-100 text-pink-800",   border: "border-pink-200" },
  Emphysema:         { bg: "bg-lime-50",   text: "text-lime-800",   badge: "bg-lime-100 text-lime-800",   border: "border-lime-200" },
  Fibrosis:          { bg: "bg-amber-50",  text: "text-amber-800",  badge: "bg-amber-100 text-amber-800",  border: "border-amber-200" },
  Pleural_Thickening:{ bg: "bg-violet-50", text: "text-violet-800", badge: "bg-violet-100 text-violet-800", border: "border-violet-200" },
  Hernia:            { bg: "bg-rose-50",   text: "text-rose-800",   badge: "bg-rose-100 text-rose-800",   border: "border-rose-200" },
  "No Finding":      { bg: "bg-slate-50",  text: "text-slate-800",  badge: "bg-slate-100 text-slate-800",  border: "border-slate-200" },
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type SearchResult = {
  image_id: string;
  patient_id: string;
  age: number;
  gender: "M" | "F";
  view_position: "PA" | "AP";
  diagnoses: string[];
  similarity: number;
  image_url?: string;
};

export type SearchResponse = {
  results: SearchResult[];
  retrieval_ms: number;
  pre_filter_count: number;
  total_indexed: number;
};
