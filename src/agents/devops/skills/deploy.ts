const words = ["deploy", "pipeline", "container", "image", "cluster", "node", "pod", "ingress", "config", "secret", "volume", "rollout", "health", "monitor", "scale"];

function pick(seed: string, offset: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return words[(hash + offset) % words.length];
}

export function deploy(seed: string): string {
  const sentence = [seed, pick(seed,1), pick(seed,2), pick(seed,3), pick(seed,4), pick(seed,5), pick(seed,6), pick(seed,7), pick(seed,8), pick(seed,9)].join(" ");
  return `[DevOps — deploy] ${sentence}`;
}
