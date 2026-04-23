const words = ["endpoint", "controller", "service", "repository", "model", "middleware", "validation", "auth", "query", "response", "request", "handler", "schema", "migration", "index"];

function pick(seed: string, offset: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return words[(hash + offset) % words.length];
}

export function implementApi(seed: string): string {
  const sentence = [seed, pick(seed,1), pick(seed,2), pick(seed,3), pick(seed,4), pick(seed,5), pick(seed,6), pick(seed,7), pick(seed,8), pick(seed,9)].join(" ");
  return `[BE — implement-api] ${sentence}`;
}
