import { dehydrate } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense } from "react";
import { CreatePostClient } from "@/components/create-post-client";
import { PostsClient } from "@/components/posts-client";
import { UsersClient } from "@/components/users-client";
import { UsersServer } from "@/components/users-server";
import { getServerHelpers, HydrateClient } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
	// Get server helpers and prefetch data
	const helpers = await getServerHelpers();
	await helpers.post.getAll.prefetch();

	return (
		<HydrateClient state={dehydrate(helpers.queryClient)}>
			<div className="min-h-screen p-8 font-sans">
				<div className="max-w-6xl mx-auto space-y-8">
					{/* Header */}
					<header className="text-center space-y-2">
						<h1 className="text-4xl font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
							tRPC + Next.js Demo
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Eksperimen dengan Client Components, Server Components, dan
							Prefetching
						</p>
						<Link
							href="/prefetch-demo"
							className="inline-block mt-4 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90"
						>
							🚀 Lihat Prefetching Demo →
						</Link>
					</header>

					{/* Main Content Grid */}
					<div className="grid md:grid-cols-2 gap-8">
						{/* Client Component Section */}
						<section className="space-y-4">
							<div className="flex items-center gap-2">
								<span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
									CLIENT
								</span>
								<h2 className="text-xl font-semibold">
									Users (Client Component)
								</h2>
							</div>
							<div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
									Data di-fetch dari client menggunakan{" "}
									<code>trpc.user.getAll.useQuery()</code>
								</p>
								<UsersClient />
							</div>
						</section>

						{/* Server Component Section */}
						<section className="space-y-4">
							<div className="flex items-center gap-2">
								<span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
									SERVER
								</span>
								<h2 className="text-xl font-semibold">
									Users (Server Component)
								</h2>
							</div>
							<div className="p-4 border border-green-200 dark:border-green-800 rounded-lg">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
									Data di-fetch langsung di server menggunakan{" "}
									<code>helpers.user.getAll.fetch()</code>
								</p>
								<Suspense
									fallback={
										<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
											Loading...
										</div>
									}
								>
									<UsersServer />
								</Suspense>
							</div>
						</section>

						{/* Create Post Section */}
						<section className="space-y-4">
							<div className="flex items-center gap-2">
								<span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
									MUTATION
								</span>
								<h2 className="text-xl font-semibold">Create Post</h2>
							</div>
							<div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
									Mutation menggunakan{" "}
									<code>trpc.post.create.useMutation()</code>
								</p>
								<CreatePostClient />
							</div>
						</section>

						{/* Posts with Prefetching */}
						<section className="space-y-4">
							<div className="flex items-center gap-2">
								<span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
									PREFETCH
								</span>
								<h2 className="text-xl font-semibold">Posts (Prefetched)</h2>
							</div>
							<div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg">
								<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
									Data di-prefetch di server dengan{" "}
									<code>helpers.post.getAll.prefetch()</code>,
									<br />
									lalu digunakan di client dengan{" "}
									<code>trpc.post.getAll.useQuery()</code>
								</p>
								<PostsClient />
							</div>
						</section>
					</div>

					{/* Info Section */}
					<section className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-4">
						<h3 className="text-lg font-semibold">📚 Cara Kerja:</h3>
						<div className="grid md:grid-cols-3 gap-4 text-sm">
							<div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
								<h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
									🖥️ Client Component
								</h4>
								<p className="text-gray-600 dark:text-gray-400">
									Data di-fetch setelah halaman load. Ada loading state. Cocok
									untuk data yang sering berubah atau butuh interaksi.
								</p>
							</div>
							<div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
								<h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
									⚡ Server Component
								</h4>
								<p className="text-gray-600 dark:text-gray-400">
									Data sudah ada saat HTML dikirim. Tidak ada loading state.
									Zero client JS. Cocok untuk data statis.
								</p>
							</div>
							<div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
								<h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">
									🚀 Prefetching
								</h4>
								<p className="text-gray-600 dark:text-gray-400">
									Data di-fetch di server, di-hydrate ke client. Kombinasi
									terbaik: fast initial load + client interactivity.
								</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</HydrateClient>
	);
}
