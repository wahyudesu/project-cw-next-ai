"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers";

/**
 * tRPC React hooks untuk Client Components
 * Usage: trpc.user.getAll.useQuery()
 */
export const trpc = createTRPCReact<AppRouter>();
