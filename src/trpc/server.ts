import "server-only";
import { cache } from "react";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createCaller, type AppRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";
import { makeQueryClient } from "./query-client";

/**
 * React cache untuk memoize query client per request
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Server-side tRPC caller yang menerima context function
 * Digunakan oleh createHydrationHelpers
 */
const caller = createCaller(createTRPCContext);

/**
 * Hydration helpers untuk prefetching
 * - HydrateClient: Wrap component yang butuh hydration
 * - serverTrpc: Server-side tRPC untuk prefetching
 * 
 * Usage di Server Component:
 *   void serverTrpc.post.getAll.prefetch();
 */
export const { trpc: serverTrpc, HydrateClient } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient
);

/**
 * Direct server caller untuk Server Components
 * Usage: const users = await serverCaller.user.getAll()
 * 
 * Gunakan ini ketika butuh data langsung di server,
 * bukan untuk prefetching ke client
 */
export const getServerCaller = cache(async () => {
	const ctx = await createTRPCContext();
	return createCaller(ctx);
});
