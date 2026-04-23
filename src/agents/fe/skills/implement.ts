export const label = "FE — implement";
export const role = "Frontend Engineer building UI components and pages";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang implementasi komponen frontend, React, dan tampilan antarmuka pengguna. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function implement(input: string): string {
  return `[${label}] ${input}`;
}
