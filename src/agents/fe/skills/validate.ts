export const label = "FE — validate";
export const role = "Frontend Engineer validating code quality and correctness";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about code validation and quality checks. The sentence must start with "${seedWord}".`;
}

export function validate(input: string): string {
  return `[${label}] ${input}`;
}
