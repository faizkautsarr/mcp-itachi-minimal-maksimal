export const label = "PM — create-spec";
export const role = "PM Agent writing product specs and requirements";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang spesifikasi produk dan kebutuhan software. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function createSpec(input: string): string {
  return `[${label}] ${input}`;
}
