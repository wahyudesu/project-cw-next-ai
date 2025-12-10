import { createAgent, openai } from "@inngest/agent-kit";

// Model untuk AI agent
const model = openai({
	model: "gpt-4.1-mini",
	baseUrl: "https://ai.sumopod.com",
	defaultParameters: { temperature: 0.5 },
});

// Joke Agent - bisa dipakai di mana saja
export const jokeAgent = createAgent({
	name: "Joke",
	description: "Joke expert",
	model,
	system:
		"You are an expert joke teller. You will be given a topic and you will create a joke about it.",
});

// Helper untuk extract text dari agent result
export function extractTextFromAgentResult(
	agentResult: Awaited<ReturnType<typeof jokeAgent.run>>,
): string {
	const textMessages: string[] = [];

	for (const msg of agentResult.output) {
		if (msg.type === "text") {
			const content = msg.content;
			if (typeof content === "string") {
				textMessages.push(content);
			} else if (Array.isArray(content)) {
				const texts = content.map(
					(c: { type: string; text: string }) => c.text,
				);
				textMessages.push(texts.join(""));
			}
		}
	}

	return textMessages.join("\n") || "No result generated";
}
