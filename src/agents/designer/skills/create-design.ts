export const label = "Designer — create-design";
export const role = "UI/UX Designer creating design specs and wireframes";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang desain UI/UX, wireframe, dan pengalaman pengguna aplikasi. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function createDesign(input: string): string {
  return `[${label}] ${input}`;
}
