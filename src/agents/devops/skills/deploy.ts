export const label = "DevOps — deploy";
export const role = "DevOps Engineer handling deployment and infrastructure";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang deployment, CI/CD pipeline, dan infrastruktur server. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function deploy(input: string): string {
  return `[${label}] ${input}`;
}
