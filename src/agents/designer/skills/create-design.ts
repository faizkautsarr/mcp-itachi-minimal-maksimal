export function createDesign(input: string): string {
  return `[Designer Agent] ${new Date().toISOString()} — received: "${input}"`;
}
