export function writeTests(input: string): string {
  return `[QA Agent] ${new Date().toISOString()} — write-tests | input: "${input}"`;
}
