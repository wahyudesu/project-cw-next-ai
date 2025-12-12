"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";

const Page = () => {
	// Code Agent prompt & result
	const [codePrompt, setCodePrompt] = useState("");
	const [codeResult, setCodeResult] = useState("");

	const invokeCodeAgent = trpc.inngest.invokeCodeAgent.useMutation({
		onSuccess: (data) => {
			toast.success("Event untuk Code Agent terkirim!");
			setCodeResult(data.message || "Event sent");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleCodeSubmit = () => {
		if (!codePrompt.trim()) {
			toast.error("Masukkan prompt terlebih dahulu!");
			return;
		}
		setCodeResult("");
		invokeCodeAgent.mutate({ prompt: codePrompt.trim() });
	};

	return (
		<div className="p-4 max-w-2xl mx-auto space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold">Code Agent</h1>
				<p className="text-muted-foreground">
					Masukkan prompt dan jalankan Code Agent (dijalankan di background via
					Inngest).
				</p>
			</div>

			{/* Code Agent runner */}
			<div className="space-y-4">
				<Input
					value={codePrompt}
					onChange={(e) => setCodePrompt(e.target.value)}
					placeholder="Masukkan prompt untuk Code Agent (misal: perbaiki file X)..."
					onKeyDown={(e) => {
						if (e.key === "Enter" && !invokeCodeAgent.isPending) {
							handleCodeSubmit();
						}
					}}
				/>
				<Button
					disabled={invokeCodeAgent.isPending || !codePrompt.trim()}
					onClick={handleCodeSubmit}
					className="w-full"
				>
					{invokeCodeAgent.isPending
						? "Mengirim ke Code Agent..."
						: "Jalankan Code Agent"}
				</Button>
			</div>

			{codeResult && (
				<div className="p-4 bg-muted rounded-lg border">
					<h3 className="font-semibold mb-2">Code Agent:</h3>
					<p className="whitespace-pre-wrap">{codeResult}</p>
				</div>
			)}
		</div>
	);
};

export default Page;
