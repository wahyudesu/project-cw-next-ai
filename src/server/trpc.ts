import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import prisma from "@/lib/prisma";
/**
 * tRPC Context - available in all procedures
 */
export const createTRPCContext = async () => {
	return {
		prisma,
	};
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<TRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
