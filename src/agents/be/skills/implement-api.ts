export const label = "BE — implement-api";
export const role = "Backend Engineer implementing REST APIs and services";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about backend APIs and services. The sentence must start with "${seedWord}".`;
}

export function implementApi(input: string): string {
  return `[${label}] ${input}`;
}
