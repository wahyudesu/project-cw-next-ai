import { getServerHelpers } from "@/trpc/server";

/**
 * Server Component - Users List
 * Data di-fetch langsung di server tanpa client-side JavaScript
 * Tidak ada loading state karena data sudah ada saat render
 */
export async function UsersServer() {
	// Direct server call - tidak ada network request!
	const helpers = await getServerHelpers();
	const users = await helpers.user.getAll.fetch();

	return (
		<div className="space-y-2">
			{users.length === 0 ? (
				<p className="text-gray-500 dark:text-gray-400 italic">
					Belum ada user. Gunakan form di Client Component untuk menambah user.
				</p>
			) : (
				users.map((user) => (
					<div
						key={user.id}
						className="p-3 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg"
					>
						<div className="flex items-center gap-2">
							<span className="text-green-600 dark:text-green-400">✓</span>
							<div>
								<p className="font-medium">{user.name || "Unnamed"}</p>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{user.email}
								</p>
								<p className="text-xs text-gray-400">
									{user.posts.length} posts •{" "}
									{user.posts.filter((p) => p.published).length} published
								</p>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
}
