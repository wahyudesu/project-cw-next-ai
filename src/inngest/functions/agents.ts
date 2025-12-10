import { extractTextFromAgentResult, jokeAgent } from "../agents/joke-agent";
import { inngest } from "../client";

export const agents = inngest.createFunction(
	{
		id: "agents",
		name: "Joke Agent",
	},
	{ event: "agentsjoke" },
	async ({ event }) => {
		const topic = event.data?.topic || "random";
		const output = await jokeAgent.run(topic);
		const result = extractTextFromAgentResult(output);

		return { result };
	},
);
