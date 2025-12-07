"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";

/**
 * tRPC React hooks untuk Client Components
 * Usage: trpc.user.getAll.useQuery()
 */
export const trpc = createTRPCReact<AppRouter>();

// Browser singleton untuk query client
let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Stale time untuk SSR - hindari refetching segera di client
				staleTime: 60 * 1000,
			},
		},
	});
}

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: selalu buat query client baru
		return makeQueryClient();
	}
	// Browser: reuse query client yang sama
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

function getBaseUrl() {
	if (typeof window !== "undefined") return "";
	// SSR should use absolute URL
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${getBaseUrl()}/api/trpc`,
					transformer: superjson,
				}),
			],
		})
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
