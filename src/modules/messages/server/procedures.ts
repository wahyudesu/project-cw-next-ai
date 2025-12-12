import { z } from "zod";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
// import { baseProcedure, createTRPCRouter } from "@/trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const messagesRouter = createTRPCRouter({
	create: baseProcedure
		.input(
			z.object({
				value: z.string().min(1, { message: "Message is required" }),
			}),
		)
		.mutation(async ({ input }) => {
			const createdMessage = await prisma.message.create({
				data: {
					content: input.value,
					role: "USER",
					type: "RESULT",
				},
			});
			await inngest.send({
				name: "test/hello-world",
				data: {
					value: input.value,
				},
			});

			return messageawait;
		}),
});
