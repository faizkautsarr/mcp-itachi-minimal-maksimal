export const label = "PM — write-ticket";
export const role = "PM Agent writing development tickets and tasks";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about development tickets and tasks. The sentence must start with "${seedWord}".`;
}

export function writeTicket(input: string): string {
  return `[${label}] ${input}`;
}
