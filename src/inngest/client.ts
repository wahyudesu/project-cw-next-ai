import { Inngest } from "inngest";

/**
 * Inngest Client
 *
 * Client ini digunakan untuk:
 * 1. Mendefinisikan functions (background jobs)
 * 2. Mengirim events untuk trigger functions
 *
 * @see https://www.inngest.com/docs
 */
export const inngest = new Inngest({
	id: "cw-next-ai", // App ID - harus unique
});
