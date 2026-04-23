export const label = "QA — write-tests";
export const role = "QA Engineer writing test cases and test suites";

export function buildStep(seedWord: string): string {
  return `Step: [${label}] — Starting with the word "${seedWord}", generate EXACTLY 10 meaningful words about testing and quality assurance. The sentence must start with "${seedWord}".`;
}

export function writeTests(input: string): string {
  return `[${label}] ${input}`;
}
