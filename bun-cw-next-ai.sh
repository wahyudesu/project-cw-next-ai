#!/usr/bin/env bash
set -e

PROJECT_NAME=${1:-my-next-app}

echo "Create Next.js Cloudflare app"
bun create cloudflare@latest "$PROJECT_NAME" --framework=next

cd "$PROJECT_NAME"

echo "Init shadcn/ui"
bunx --bun shadcn@latest init -y

echo "Install all shadcn components"
bunx --bun shadcn@latest add -a

echo "Done"

echo "Install Drizzle ORM + Postgres"
bun install drizzle-orm postgres
bun install -d drizzle-kit

echo "Create Drizzle config"
cat <<'EOF' > drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
});
EOF

echo "Create db folder & schema"
mkdir -p src/db

cat <<'EOF' > src/db/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
EOF

cat <<'EOF' > src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client);
EOF

echo "Add env example"
cat <<'EOF' > .env.example
DATABASE_URL=postgres://user:password@localhost:5432/dbname
EOF

echo "=== Setup tRPC ==="
bun add @trpc/server @trpc/client @trpc/react-query @tanstack/react-query superjson zod

echo "Create tRPC server setup"
mkdir -p src/server/trpc

cat <<'EOF' > src/server/trpc/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
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

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
EOF

cat <<'EOF' > src/server/trpc/routers/user.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(users);
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const result = await db.select().from(users).where(eq(users.id, input.id));
      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().email() }))
    .mutation(async ({ input }) => {
      const result = await db.insert(users).values(input).returning();
      return result[0];
    }),
});
EOF

mkdir -p src/server/trpc/routers

cat <<'EOF' > src/server/trpc/routers/index.ts
import { createTRPCRouter } from "../trpc";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
EOF

echo "Create tRPC HTTP handler for App Router"
mkdir -p src/app/api/trpc/\[trpc\]

cat <<'EOF' > src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/trpc/routers";
import { createTRPCContext } from "@/server/trpc/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });

export { handler as GET, handler as POST };
EOF

echo "Create tRPC client setup"
mkdir -p src/trpc

cat <<'EOF' > src/trpc/client.ts
"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/trpc/routers";

export const trpc = createTRPCReact<AppRouter>();
EOF

cat <<'EOF' > src/trpc/server.ts
import "server-only";
import { createTRPCContext, createCallerFactory } from "@/server/trpc/trpc";
import { appRouter } from "@/server/trpc/routers";
import { headers } from "next/headers";
import { cache } from "react";

const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const createCaller = createCallerFactory(appRouter);

export const api = async () => createCaller(await createContext());
EOF

cat <<'EOF' > src/trpc/query-client.ts
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
EOF

echo "Create tRPC Provider"
cat <<'EOF' > src/trpc/provider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "./client";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: ReturnType<typeof createQueryClient> | undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  return (clientQueryClientSingleton ??= createQueryClient());
};

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getBaseUrl() + "/api/trpc",
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
EOF

echo "Create HydrateClient for prefetching"
cat <<'EOF' > src/trpc/hydrate-client.tsx
"use client";

import { HydrationBoundary } from "@tanstack/react-query";

export function HydrateClient(props: {
  children: React.ReactNode;
  state: unknown;
}) {
  return (
    <HydrationBoundary state={props.state}>{props.children}</HydrationBoundary>
  );
}
EOF

echo "=== Experiment: Client Component ==="
mkdir -p src/components/examples

cat <<'EOF' > src/components/examples/user-list-client.tsx
"use client";

import { trpc } from "@/trpc/client";

export function UserListClient() {
  const { data: users, isLoading, error } = trpc.user.getAll.useQuery();

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Users (Client Component)</h2>
      <ul className="space-y-2">
        {users?.map((user) => (
          <li key={user.id} className="p-2 bg-gray-100 rounded">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

cat <<'EOF' > src/components/examples/create-user-client.tsx
"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

export function CreateUserClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const utils = trpc.useUtils();
  const createUser = trpc.user.create.useMutation({
    onSuccess: () => {
      utils.user.getAll.invalidate();
      setName("");
      setEmail("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Create User (Client Component)</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={createUser.isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {createUser.isPending ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
EOF

echo "=== Experiment: Server Component ==="
cat <<'EOF' > src/components/examples/user-list-server.tsx
import { api } from "@/trpc/server";

export async function UserListServer() {
  const caller = await api();
  const users = await caller.user.getAll();

  return (
    <div className="p-4 border rounded-lg border-green-500">
      <h2 className="text-xl font-bold mb-4">Users (Server Component)</h2>
      <p className="text-sm text-green-600 mb-2">✓ Data fetched on server, no loading state!</p>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="p-2 bg-green-50 rounded">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

echo "=== Preview Prefetching ==="
cat <<'EOF' > src/app/users/page.tsx
import { dehydrate } from "@tanstack/react-query";
import { api } from "@/trpc/server";
import { createQueryClient } from "@/trpc/query-client";
import { HydrateClient } from "@/trpc/hydrate-client";
import { UserListClient } from "@/components/examples/user-list-client";
import { CreateUserClient } from "@/components/examples/create-user-client";
import { UserListServer } from "@/components/examples/user-list-server";

export default async function UsersPage() {
  const queryClient = createQueryClient();
  const caller = await api();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: [["user", "getAll"], { type: "query" }],
    queryFn: () => caller.user.getAll(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">tRPC Examples</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Server Component (Direct Call)</h2>
        <UserListServer />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Client Component with Prefetching</h2>
        <p className="text-gray-600 mb-2">Data prefetched on server, hydrated on client - instant load!</p>
        <HydrateClient state={dehydratedState}>
          <UserListClient />
        </HydrateClient>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Client Component (Mutation)</h2>
        <CreateUserClient />
      </section>
    </div>
  );
}
EOF

echo "Update layout.tsx to include TRPCProvider"
cat <<'EOF' > src/app/layout.tsx
import type { Metadata } from "next";
import { TRPCProvider } from "@/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + tRPC + Drizzle",
  description: "Full-stack TypeScript with tRPC and Drizzle ORM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
EOF

echo "Create users folder"
mkdir -p src/app/users

echo "Update tsconfig paths"
cat <<'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

echo "Add db scripts to package.json"
cat <<'EOF' > package.json
{
  "name": "next",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts"
  },
  "dependencies": {
    "@opennextjs/cloudflare": "latest",
    "@tanstack/react-query": "^5",
    "@trpc/client": "^11",
    "@trpc/react-query": "^11",
    "@trpc/server": "^11",
    "drizzle-orm": "latest",
    "next": "15",
    "postgres": "latest",
    "react": "19",
    "react-dom": "19",
    "server-only": "latest",
    "superjson": "^2",
    "zod": "^3"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "drizzle-kit": "latest",
    "eslint": "^9",
    "eslint-config-next": "15",
    "tailwindcss": "^4",
    "typescript": "^5",
    "wrangler": "^4"
  }
}
EOF

echo "=== All Done! ==="
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure DATABASE_URL"
echo "2. Run 'bun db:push' to push schema to database"
echo "3. Run 'bun dev' to start development server"
echo "4. Visit /users to see tRPC examples"