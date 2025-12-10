import { createCallerFactory, createTRPCRouter } from "../trpc";
import { inngestRouter } from "./inngest";
import { postRouter } from "./post";
import { userRouter } from "./user";

/**
 * Root Router - combine all routers here
 */
export const appRouter = createTRPCRouter({
	user: userRouter,
	post: postRouter,
	inngest: inngestRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;

// Export caller factory for server-side usage
export const createCaller = createCallerFactory(appRouter);
