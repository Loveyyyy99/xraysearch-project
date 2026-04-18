import { API_BASE_URL, SearchResponse } from "./constants";

export interface SearchParams {
  file: File;
  age_group?: string;
  gender?: string;
  diagnosis?: string;
  top_k?: number;
}

export async function searchSimilarXrays(params: SearchParams): Promise<SearchResponse> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.age_group) formData.append("age_group", params.age_group);
  if (params.gender) formData.append("gender", params.gender);
  if (params.diagnosis) formData.append("diagnosis", params.diagnosis);
  formData.append("top_k", String(params.top_k ?? 6));

  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `Server error: ${response.status}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<{ status: string; indexed: number }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("Backend offline");
  return response.json();
}
