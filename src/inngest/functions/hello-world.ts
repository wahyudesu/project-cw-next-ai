import { inngest } from "../client";

/**
 * Hello World Function
 *
 * Function pertama untuk testing Inngest.
 * Triggered by event: "test/hello.world"
 */
export const helloWorld = inngest.createFunction(
	{
		id: "hello-world", // Unique function ID
		name: "Hello World", // Display name di dashboard
	},
	{ event: "test/hello.world" }, // Event trigger
	async ({ event, step }) => {
		// Step 1: Log event data
		await step.run("log-event", async () => {
			console.log("📩 Received event:", event.name);
			console.log("📦 Event data:", JSON.stringify(event.data, null, 2));
			return { logged: true };
		});

		// Step 2: Simulate some processing
		await step.sleep("wait-a-moment", "2s");

		// Step 3: Do something with the data
		const result = await step.run("process-data", async () => {
			const name = event.data?.name || "World";
			const message = `Hello, ${name}! 👋`;
			console.log("✅ Generated message:", message);
			return { message, processedAt: new Date().toISOString() };
		});

		return result;
	}
);
