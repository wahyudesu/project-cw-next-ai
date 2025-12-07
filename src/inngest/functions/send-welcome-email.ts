import { inngest } from "../client";

/**
 * Send Welcome Email Function
 *
 * Simulasi mengirim welcome email ke user baru.
 * Triggered by event: "user/created"
 *
 * Ini adalah contoh real-world use case untuk background jobs:
 * - Tidak memblokir response ke user
 * - Bisa retry otomatis jika gagal
 * - Bisa di-monitor di Inngest dashboard
 */
export const sendWelcomeEmail = inngest.createFunction(
	{
		id: "send-welcome-email",
		name: "Send Welcome Email",
		retries: 3, // Retry 3x jika gagal
	},
	{ event: "user/created" },
	async ({ event, step }) => {
		const { email, name } = event.data;

		// Step 1: Validate email
		const isValid = await step.run("validate-email", async () => {
			console.log(`📧 Validating email: ${email}`);
			// Simulasi validasi
			const valid = email && email.includes("@");
			if (!valid) throw new Error("Invalid email address");
			return { valid: true };
		});

		// Step 2: Generate email content
		const emailContent = await step.run("generate-content", async () => {
			console.log(`📝 Generating email content for: ${name || email}`);
			return {
				subject: `Welcome to our app, ${name || "there"}! 🎉`,
				body: `
Hi ${name || "there"},

Thanks for signing up! We're excited to have you on board.

Here are some things you can do:
- Explore our features
- Create your first post
- Connect with other users

Happy exploring!
The Team
        `.trim(),
			};
		});

		// Step 3: Simulate sending email (in real app, use email service)
		await step.run("send-email", async () => {
			console.log(`📤 Sending email to: ${email}`);
			console.log(`   Subject: ${emailContent.subject}`);
			// Simulasi delay sending
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log(`✅ Email sent successfully!`);
			return { sent: true, to: email };
		});

		// Step 4: Log to analytics (optional step)
		await step.run("log-analytics", async () => {
			console.log(`📊 Logging welcome email sent to analytics`);
			return { logged: true };
		});

		return {
			success: true,
			email,
			sentAt: new Date().toISOString(),
		};
	}
);
