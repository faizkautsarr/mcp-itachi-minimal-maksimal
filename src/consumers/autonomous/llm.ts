export async function generateWords(instruction: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: instruction }],
      max_tokens: 100,
      temperature: 0.7
    })
  });

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content.trim();
}
