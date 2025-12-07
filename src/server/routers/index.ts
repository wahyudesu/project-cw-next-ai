import { createCallerFactory, createTRPCRouter } from "../trpc";
import { userRouter } from "./user";
import { postRouter } from "./post";

/**
 * Root Router - combine all routers here
 */
export const appRouter = createTRPCRouter({
	user: userRouter,
	post: postRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;

// Export caller factory for server-side usage
export const createCaller = createCallerFactory(appRouter);
