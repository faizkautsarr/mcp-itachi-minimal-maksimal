import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function generateAgentOutput(role: string, context: string, seed: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 60,
    messages: [{
      role: "user",
      content: `You are a ${role}. Starting with the word "${seed}", write exactly 10 words about ${context}. First word must be "${seed}". Return only the 10 words, nothing else.`
    }]
  });
  const raw = response.content[0].type === "text" ? response.content[0].text.trim() : seed;
  return raw.startsWith(seed) ? raw : `${seed} ${raw}`;
}
