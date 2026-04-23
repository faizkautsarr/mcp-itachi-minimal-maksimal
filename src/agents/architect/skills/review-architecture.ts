export const label = "Architect — review";
export const role = "Software Architect designing system architecture";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about system architecture and design. The sentence must start with "${seedWord}".`;
}

export function reviewArchitecture(input: string): string {
  return `[${label}] ${input}`;
}
