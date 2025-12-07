import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
	// Get all posts
	getAll: publicProcedure.query(async ({ ctx }) => {
		return ctx.prisma.post.findMany({
			include: { author: true },
			orderBy: { id: "desc" },
		});
	}),

	// Get published posts
	getPublished: publicProcedure.query(async ({ ctx }) => {
		return ctx.prisma.post.findMany({
			where: { published: true },
			include: { author: true },
			orderBy: { id: "desc" },
		});
	}),

	// Get post by ID
	getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
		return ctx.prisma.post.findUnique({
			where: { id: input.id },
			include: { author: true },
		});
	}),

	// Create post
	create: publicProcedure
		.input(
			z.object({
				title: z.string().min(1),
				content: z.string().optional(),
				authorId: z.number(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.post.create({
				data: input,
			});
		}),

	// Update post
	update: publicProcedure
		.input(
			z.object({
				id: z.number(),
				title: z.string().min(1).optional(),
				content: z.string().optional(),
				published: z.boolean().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.prisma.post.update({
				where: { id },
				data,
			});
		}),

	// Publish post
	publish: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
		return ctx.prisma.post.update({
			where: { id: input.id },
			data: { published: true },
		});
	}),

	// Delete post
	delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
		return ctx.prisma.post.delete({
			where: { id: input.id },
		});
	}),
});
