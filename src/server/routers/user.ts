import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
	// Get all users
	getAll: publicProcedure.query(async ({ ctx }) => {
		return ctx.prisma.user.findMany({
			include: { posts: true },
		});
	}),

	// Get user by ID
	getById: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.user.findUnique({
				where: { id: input.id },
				include: { posts: true },
			});
		}),

	// Create user
	create: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				name: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.create({
				data: input,
			});
		}),

	// Update user
	update: publicProcedure
		.input(
			z.object({
				id: z.number(),
				email: z.string().email().optional(),
				name: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.prisma.user.update({
				where: { id },
				data,
			});
		}),

	// Delete user
	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.delete({
				where: { id: input.id },
			});
		}),
});
