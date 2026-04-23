export const label = "Architect — review";
export const role = "Software Architect designing system architecture";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang arsitektur sistem, microservices, dan desain teknis software. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function reviewArchitecture(input: string): string {
  return `[${label}] ${input}`;
}
