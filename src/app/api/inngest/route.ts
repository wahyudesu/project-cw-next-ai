import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld, sendWelcomeEmail, agents  } from "@/inngest/functions";

/**
 * Inngest API Route
 *
 * Route ini:
 * 1. Mendaftarkan semua functions ke Inngest
 * 2. Menerima events dari Inngest untuk execute functions
 *
 * Akses Inngest Dev Server di: http://localhost:8288
 */
export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		helloWorld,
		sendWelcomeEmail,
		agents
		// Tambahkan functions baru di sini
	],
});
