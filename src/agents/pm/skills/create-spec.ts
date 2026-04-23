export function createSpec(input: string): string {
  return `[PM Agent] ${new Date().toISOString()} — received: "${input}"`;
}
