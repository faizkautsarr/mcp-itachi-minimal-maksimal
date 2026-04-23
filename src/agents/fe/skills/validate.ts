export const label = "FE — validate";
export const role = "Frontend Engineer validating code quality and correctness";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang validasi kode, code review, dan pengecekan kualitas frontend. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function validate(input: string): string {
  return `[${label}] ${input}`;
}
