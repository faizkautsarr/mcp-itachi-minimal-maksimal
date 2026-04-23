export const label = "Designer — create-design";
export const role = "UI/UX Designer creating design specs and wireframes";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about UI/UX design and visual specs. The sentence must start with "${seedWord}".`;
}

export function createDesign(input: string): string {
  return `[${label}] ${input}`;
}
