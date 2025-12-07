import { inngest } from "../client";
import { jokeAgent, extractTextFromAgentResult } from "../agents/joke-agent";

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
	}
);
