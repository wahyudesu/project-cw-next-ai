"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

/**
 * Client Component - Create Post Form
 */
export function CreatePostClient() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [authorId, setAuthorId] = useState("");

	const { data: users } = trpc.user.getAll.useQuery();
	const utils = trpc.useUtils();

	const createPost = trpc.post.create.useMutation({
		onSuccess: () => {
			// Invalidate posts query untuk refetch
			utils.post.getAll.invalidate();
			setTitle("");
			setContent("");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (title && authorId) {
			createPost.mutate({
				title,
				content: content || undefined,
				authorId: parseInt(authorId),
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<div>
				<label className="block text-sm font-medium mb-1">Author</label>
				<select
					value={authorId}
					onChange={(e) => setAuthorId(e.target.value)}
					className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
					required
				>
					<option value="">Select author...</option>
					{users?.map((user) => (
						<option key={user.id} value={user.id}>
							{user.name || user.email}
						</option>
					))}
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Title</label>
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
					placeholder="Post title"
					required
				/>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Content (optional)</label>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
					placeholder="Post content..."
					rows={3}
				/>
			</div>
			<button
				type="submit"
				disabled={createPost.isPending || !users?.length}
				className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
			>
				{createPost.isPending ? "Creating..." : "Create Post"}
			</button>
			{!users?.length && (
				<p className="text-sm text-yellow-600 dark:text-yellow-400">
					⚠️ Tambahkan user terlebih dahulu sebelum membuat post
				</p>
			)}
		</form>
	);
}
