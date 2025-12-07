import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { inngest } from "@/inngest/client";

/**
 * Inngest Router - untuk trigger background jobs via tRPC
 */
export const inngestRouter = createTRPCRouter({
	// Invoke hello world function
	invoke: publicProcedure
		.input(
			z.object({
				text: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			// Send event to Inngest
			await inngest.send({
				name: "test/hello.world",
				data: {
					name: input.text || "World",
				},
			});

			return { success: true, message: "Background job started" };
		}),
});
