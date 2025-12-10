"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";

const Page = () => {
	const [topic, setTopic] = useState("");
	const [result, setResult] = useState("");

	const invokeAgent = trpc.inngest.invokeAgent.useMutation({
		onSuccess: (data) => {
			toast.success("Joke berhasil dibuat!");
			setResult(data.result);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = () => {
		if (!topic.trim()) {
			toast.error("Masukkan topik terlebih dahulu!");
			return;
		}
		setResult(""); // Clear previous result
		invokeAgent.mutate({ topic: topic.trim() });
	};

	return (
		<div className="p-4 max-w-2xl mx-auto space-y-6">
			<div className="space-y-2">
				<h1 className="text-2xl font-bold">AI Joke Generator</h1>
				<p className="text-muted-foreground">
					Masukkan topik dan AI akan membuat lelucon untuk Anda!
				</p>
			</div>

			<div className="space-y-4">
				<Input
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
					placeholder="Masukkan topik (misal: kucing, programmer, kopi)..."
					onKeyDown={(e) => {
						if (e.key === "Enter" && !invokeAgent.isPending) {
							handleSubmit();
						}
					}}
				/>
				<Button
					disabled={invokeAgent.isPending || !topic.trim()}
					onClick={handleSubmit}
					className="w-full"
				>
					{invokeAgent.isPending ? "Sedang membuat joke..." : "Buat Joke!"}
				</Button>
			</div>

			{result && (
				<div className="p-4 bg-muted rounded-lg border">
					<h3 className="font-semibold mb-2">Hasil:</h3>
					<p className="whitespace-pre-wrap">{result}</p>
				</div>
			)}

			{invokeAgent.isPending && (
				<div className="flex items-center justify-center p-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			)}
		</div>
	);
};

export default Page;
