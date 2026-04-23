export const label = "QA — write-tests";
export const role = "QA Engineer writing test cases and test suites";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang penulisan test, pengujian otomatis, dan quality assurance software. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function writeTests(input: string): string {
  return `[${label}] ${input}`;
}
