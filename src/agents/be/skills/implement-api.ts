export const label = "BE — implement-api";
export const role = "Backend Engineer implementing REST APIs and services";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang implementasi API backend, endpoint REST, dan logika bisnis server. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function implementApi(input: string): string {
  return `[${label}] ${input}`;
}
