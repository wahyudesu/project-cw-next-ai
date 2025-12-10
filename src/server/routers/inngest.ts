import { z } from "zod";
import {
	extractTextFromAgentResult,
	jokeAgent,
} from "@/inngest/agents/joke-agent";
import { inngest } from "@/inngest/client";
import { createTRPCRouter, publicProcedure } from "../trpc";

/**
 * Inngest Router - untuk trigger background jobs via tRPC
 */
export const inngestRouter = createTRPCRouter({
	// Invoke hello world function (background job)
	invoke: publicProcedure
		.input(
			z.object({
				text: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			await inngest.send({
				name: "test/hello.world",
				data: {
					name: input.text || "World",
				},
			});

			return { success: true, message: "Background job started" };
		}),

	// Invoke AI Agent - menggunakan shared jokeAgent
	invokeAgent: publicProcedure
		.input(
			z.object({
				topic: z.string().min(1, "Topic harus diisi"),
			}),
		)
		.mutation(async ({ input }) => {
			// Kirim event ke Inngest untuk tracking di dashboard
			await inngest.send({
				name: "agentsjoke",
				data: {
					topic: input.topic,
				},
			});

			// Jalankan agent (menggunakan shared module)
			const agentResult = await jokeAgent.run(input.topic);
			const result = extractTextFromAgentResult(agentResult);

			return { success: true, result };
		}),
});
