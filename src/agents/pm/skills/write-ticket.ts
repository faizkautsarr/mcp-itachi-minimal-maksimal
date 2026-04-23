export const label = "PM — write-ticket";
export const role = "PM Agent writing development tickets and tasks";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Mulai dengan kata "${seedWord}", buat TEPAT 10 kata dalam Bahasa Indonesia yang bermakna tentang tiket pengembangan, user story, dan task sprint. Kalimat harus dimulai dengan "${seedWord}".`;
}

export function writeTicket(input: string): string {
  return `[${label}] ${input}`;
}
