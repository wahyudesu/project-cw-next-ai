"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/trpc/client";
import { makeQueryClient } from "@/trpc/query-client";

// Browser singleton untuk query client
let browserQueryClient: ReturnType<typeof makeQueryClient> | undefined = undefined;

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

export function TRPCProvider({ children }: { children: React.ReactNode }) {
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
