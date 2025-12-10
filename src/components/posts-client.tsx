"use client";

import { trpc } from "@/trpc/client";

/**
 * Client Component - Posts List dengan tRPC
 * Menggunakan data yang sudah di-prefetch dari server
 */
export function PostsClient() {
	// Menggunakan prefetched data dari server (HydrateClient)
	const { data: posts, isLoading, error } = trpc.post.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
				<p className="text-purple-600 dark:text-purple-400">
					⏳ Loading posts...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
				<p className="text-red-600 dark:text-red-400">
					❌ Error: {error.message}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{posts?.length === 0 ? (
				<p className="text-gray-500 dark:text-gray-400 italic">
					Belum ada posts. Buat user terlebih dahulu lalu tambahkan post!
				</p>
			) : (
				posts?.map((post) => (
					<div
						key={post.id}
						className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-purple-500"
					>
						<div className="flex items-start justify-between">
							<h3 className="font-semibold">{post.title}</h3>
							<span
								className={`text-xs px-2 py-1 rounded ${
									post.published
										? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
										: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
								}`}
							>
								{post.published ? "Published" : "Draft"}
							</span>
						</div>
						{post.content && (
							<p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
								{post.content}
							</p>
						)}
						<p className="mt-2 text-xs text-gray-400">
							by {post.author.name || post.author.email}
						</p>
					</div>
				))
			)}
		</div>
	);
}
