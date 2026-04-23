export function validate(input: string): string {
  return `[FE Agent] ${new Date().toISOString()} — validate: "${input}"`;
}
