export function writeTicket(input: string): string {
  return `[PM Agent] ${new Date().toISOString()} — write-ticket | input: "${input}"`;
}
