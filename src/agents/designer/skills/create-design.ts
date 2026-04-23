export function createDesign(input: string): string {
  return `[Designer Agent] ${new Date().toISOString()} — create-design | input: "${input}"`;
}
