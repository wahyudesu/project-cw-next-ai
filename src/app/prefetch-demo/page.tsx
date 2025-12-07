import Link from "next/link";
import { HydrateClient, serverTrpc, getServerCaller } from "@/trpc/server";
import { PostsClient } from "@/components/posts-client";

export const dynamic = "force-dynamic";

/**
 * Demo halaman dengan Prefetching
 *
 * Pattern ini menggabungkan keunggulan Server & Client Components:
 * 1. Data di-fetch di server saat render (fast initial load)
 * 2. Data di-hydrate ke React Query cache di client
 * 3. Client component bisa langsung pakai data tanpa loading
 * 4. Client component tetap bisa refetch, mutate, dll
 */
export default async function PrefetchDemo() {
	// Method 1: Prefetch untuk client components
	// Data akan di-dehydrate dan dikirim ke client
	void serverTrpc.post.getAll.prefetch();
	void serverTrpc.user.getAll.prefetch();

	// Method 2: Direct server call untuk server component
	// Data digunakan langsung di server, tidak dikirim ke client cache
	const serverCaller = await getServerCaller();
	const stats = {
		totalUsers: (await serverCaller.user.getAll()).length,
		totalPosts: (await serverCaller.post.getAll()).length,
		publishedPosts: (await serverCaller.post.getPublished()).length,
	};

	return (
		<HydrateClient>
			<div className="min-h-screen p-8 font-sans">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Header */}
					<header className="space-y-4">
						<Link href="/" className="text-blue-500 hover:underline">
							← Kembali ke Home
						</Link>
						<h1 className="text-3xl font-bold">🚀 Prefetching Demo</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Demonstrasi prefetching data di Server Component untuk Client Component
						</p>
					</header>

					{/* Stats dari Server (langsung di-render, no hydration) */}
					<section className="p-6 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl">
						<h2 className="text-lg font-semibold mb-4">📊 Stats (Server-rendered)</h2>
						<div className="grid grid-cols-3 gap-4 text-center">
							<div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
								<p className="text-3xl font-bold text-blue-500">{stats.totalUsers}</p>
								<p className="text-sm text-gray-500">Total Users</p>
							</div>
							<div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
								<p className="text-3xl font-bold text-purple-500">{stats.totalPosts}</p>
								<p className="text-sm text-gray-500">Total Posts</p>
							</div>
							<div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
								<p className="text-3xl font-bold text-green-500">{stats.publishedPosts}</p>
								<p className="text-sm text-gray-500">Published</p>
							</div>
						</div>
						<p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
							Data ini di-render di server menggunakan <code>getServerCaller()</code> - tidak ada JavaScript
							yang dikirim ke client untuk bagian ini.
						</p>
					</section>

					{/* Posts dengan Prefetch */}
					<section className="space-y-4">
						<div className="flex items-center gap-2">
							<span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
								PREFETCHED
							</span>
							<h2 className="text-xl font-semibold">Posts List</h2>
						</div>
						<div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg">
							<PostsClient />
						</div>
					</section>

					{/* Explanation */}
					<section className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-4">
						<h3 className="text-lg font-semibold">🔍 Apa yang terjadi?</h3>
						<ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
							<li>
								Server Component memanggil <code>serverTrpc.post.getAll.prefetch()</code>
							</li>
							<li>Data di-fetch dari database di server</li>
							<li>
								Data di-serialize dan dikirim ke client sebagai bagian dari HTML (dehydrated state)
							</li>
							<li>
								React Query di client menerima data ini (hydration) dan mengisi cache
							</li>
							<li>
								<code>PostsClient</code> memanggil <code>trpc.post.getAll.useQuery()</code>
							</li>
							<li>
								Data sudah ada di cache! Tidak ada loading state, tidak ada network request
							</li>
							<li>
								Client component tetap bisa refetch, invalidate cache, dan lakukan mutations
							</li>
						</ol>
					</section>

					{/* Code Example */}
					<section className="p-6 bg-gray-900 text-gray-100 rounded-xl space-y-4 overflow-x-auto">
						<h3 className="text-lg font-semibold text-white">💻 Code Example</h3>
						<pre className="text-sm">
							{`// Di Server Component (page.tsx)
export default async function Page() {
  // Prefetch data untuk client components
  void serverTrpc.post.getAll.prefetch();
  
  return (
    <HydrateClient>
      <PostsClient /> {/* Client component */}
    </HydrateClient>
  );
}

// Di Client Component (posts-client.tsx)
"use client";
export function PostsClient() {
  // Data sudah ada! Tidak ada loading state
  const { data } = trpc.post.getAll.useQuery();
  return <div>{/* render posts */}</div>;
}`}
						</pre>
					</section>
				</div>
			</div>
		</HydrateClient>
	);
}
