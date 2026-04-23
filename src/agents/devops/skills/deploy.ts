export const label = "DevOps — deploy";
export const role = "DevOps Engineer handling deployment and infrastructure";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about deployment and infrastructure. The sentence must start with "${seedWord}".`;
}

export function deploy(input: string): string {
  return `[${label}] ${input}`;
}
