import "server-only";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { cache } from "react";
import superjson from "superjson";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

/**
 * Create server-side helpers with proper context
 * This provides server-side prefetch and fetch capabilities
 */
export const getServerHelpers = cache(async () => {
	const ctx = await createTRPCContext();

	return createServerSideHelpers({
		router: appRouter,
		ctx,
		transformer: superjson,
	});
});

/**
 * HydrateClient component untuk wrapping client components
 * Import dari @tanstack/react-query
 */
export { HydrationBoundary as HydrateClient } from "@tanstack/react-query";
