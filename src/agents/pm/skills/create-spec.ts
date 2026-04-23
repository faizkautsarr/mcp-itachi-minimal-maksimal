export const label = "PM — create-spec";
export const role = "PM Agent writing product specs and requirements";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about product specs and requirements. The sentence must start with "${seedWord}".`;
}

export function createSpec(input: string): string {
  return `[${label}] ${input}`;
}
