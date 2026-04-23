export const label = "FE — implement";
export const role = "Frontend Engineer building UI components and pages";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about frontend components and UI implementation. The sentence must start with "${seedWord}".`;
}

export function implement(input: string): string {
  return `[${label}] ${input}`;
}
