import Sandbox from "@e2b/code-interpreter";
import {
	createAgent,
	createNetwork,
	createTool,
	openai,
} from "@inngest/agent-kit";
import z from "zod";
import { PROMPT } from "@/prompt";
import { inngest } from "../client";
import { getSandbox, lastAssistantTextMessageContent } from "../utils";

// Model untuk AI agent
const model = openai({
	model: "gpt-4.1-mini",
	baseUrl: "https://ai.sumopod.com",
	defaultParameters: { temperature: 0.5 },
});

export const codeAgents = inngest.createFunction(
	{ id: "code-agents" },
	{ event: "agents/code-agents" },
	async ({ event, step }) => {
		const sandboxId = await step.run("get-sandbox-id", async () => {
			const sandbox = await Sandbox.create("vibe-nextjs-test-2");
			return sandbox.sandboxId;
		});

		const codeAgent = createAgent({
			name: "code-agent",
			description: "An expert code agent",
			system: PROMPT,
			model,
			tools: [
				// terminal use
				createTool({
					name: "terminal",
					description: "Use the terminal to run commands",
					parameters: z.object({
						command: z.string(),
					}),
					handler: async ({ command }) => {
						const buffers = { stdout: "", stderr: "" };

						try {
							const sandbox = await getSandbox(sandboxId);
							const result = await sandbox.commands.run(command, {
								onStdout: (data: string) => {
									buffers.stdout += data;
								},
								onStderr: (data: string) => {
									buffers.stderr += data;
								},
							});
							return result.stdout;
						} catch (e) {
							console.error(
								`Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`,
							);
							return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
						}
					},
				}),
				// create or update file
				createTool({
					name: "createOrUpdateFiles",
					description: "Create or update files in the sandbox",
					parameters: z.object({
						files: z.array(
							z.object({
								path: z.string(),
								content: z.string(),
							}),
						),
					}),
					handler: async ({ files }, { step, network }) => {
						const newFiles = await step?.run(
							"createOrUpdateFiles",
							async () => {
								try {
									const updatedFiles = network.state.data.files || {};
									const sandbox = await getSandbox(sandboxId);
									for (const file of files) {
										updatedFiles[file.path] = file.content;
										await sandbox.files.write(file.path, file.content);
									}

									return updatedFiles;
								} catch (e) {
									return `Error:${e}`;
								}
							},
						);

						if (typeof newFiles === "object" && newFiles) {
							network.state.data.files = newFiles;
						}
					},
				}),
				// read files
				createTool({
					name: "readFiles",
					description: "Read files in the sandbox",
					parameters: z.object({
						paths: z.array(z.string()),
					}),
					handler: async ({ paths }, { step }) => {
						return await step?.run("readFiles", async () => {
							try {
								const sandbox = await getSandbox(sandboxId);
								const contents = [];
								for (const path of paths) {
									const content = await sandbox.files.read(path);
									contents.push({ path, content });
								}
								return JSON.stringify(contents);
							} catch (e) {
								return `Error:${e}`;
							}
						});
					},
				}),
			],
			lifecycle: {
				onResponse: async ({ result, network }) => {
					// Extract last assistant message content directly from result
					const lastAssistantTextMessageText =
						lastAssistantTextMessageContent(result);

					if (lastAssistantTextMessageText && network) {
						if (lastAssistantTextMessageText.includes("<task_summary>")) {
							network.state.data.summary = lastAssistantTextMessageText;
						}
					}

					return result;
				},
			},
		});

		const network = createNetwork({
			name: "coding-agent-network",
			agents: [codeAgent],
			maxIter: 15,
			router: async ({ network }) => {
				const summary = network.state.data.summary;

				if (summary) {
					return;
				}

				return codeAgent;
			},
		});

		const result = await network.run(event.data.value);

		const sandboxUrl = await step.run("get-sandbox-url", async () => {
			const sandbox = await getSandbox(sandboxId);
			const host = sandbox.getHost(3000);

			return `http://${host}`;
		});

		return {
			url: sandboxUrl,
			title: "Fragment",
			files: result.state.data.files,
			summary: result.state.data.summary,
		};
	},
);
