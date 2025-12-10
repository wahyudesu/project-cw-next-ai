"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";

/**
 * Client Component - Users List dengan tRPC React Query hooks
 * Data di-fetch dari client side menggunakan useQuery
 */
export function UsersClient() {
	const [newUserEmail, setNewUserEmail] = useState("");
	const [newUserName, setNewUserName] = useState("");

	// Query untuk get all users
	const {
		data: users,
		isLoading,
		error,
		refetch,
	} = trpc.user.getAll.useQuery();

	// Mutation untuk create user
	const createUser = trpc.user.create.useMutation({
		onSuccess: () => {
			refetch();
			setNewUserEmail("");
			setNewUserName("");
		},
	});

	// Mutation untuk delete user
	const deleteUser = trpc.user.delete.useMutation({
		onSuccess: () => refetch(),
	});

	if (isLoading) {
		return (
			<div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
				<p className="text-blue-600 dark:text-blue-400">
					⏳ Loading users dari client...
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
		<div className="space-y-4">
			{/* Form tambah user */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (newUserEmail) {
						createUser.mutate({
							email: newUserEmail,
							name: newUserName || undefined,
						});
					}
				}}
				className="flex flex-col sm:flex-row gap-2"
			>
				<input
					type="email"
					placeholder="Email"
					value={newUserEmail}
					onChange={(e) => setNewUserEmail(e.target.value)}
					className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
					required
				/>
				<input
					type="text"
					placeholder="Name (optional)"
					value={newUserName}
					onChange={(e) => setNewUserName(e.target.value)}
					className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
				/>
				<button
					type="submit"
					disabled={createUser.isPending}
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
				>
					{createUser.isPending ? "Adding..." : "Add User"}
				</button>
			</form>

			{/* List users */}
			<div className="space-y-2">
				{users?.length === 0 ? (
					<p className="text-gray-500 dark:text-gray-400 italic">
						Belum ada user. Tambahkan user baru!
					</p>
				) : (
					users?.map((user) => (
						<div
							key={user.id}
							className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
						>
							<div>
								<p className="font-medium">{user.name || "Unnamed"}</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{user.email}
								</p>
								<p className="text-xs text-gray-400 dark:text-gray-500">
									{user.posts.length} posts
								</p>
							</div>
							<button
								type="button"
								onClick={() => deleteUser.mutate({ id: user.id })}
								disabled={deleteUser.isPending}
								className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
							>
								Delete
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}
