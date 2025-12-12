"use client";

import {
	ArrowRight,
	ChevronDown,
	Paperclip,
	Rocket,
	Upload,
} from "lucide-react";
import { useState } from "react";
import PixelBlast from "@/components/PixelBlast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
	const [inputValue, setInputValue] = useState("");

	return (
		<div className="relative min-h-screen w-full bg-black overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0">
				<PixelBlast
					variant="circle"
					pixelSize={6}
					color="#B19EEF"
					patternScale={3}
					patternDensity={1.2}
					pixelSizeJitter={0.5}
					enableRipples
					rippleSpeed={0.4}
					rippleThickness={0.12}
					rippleIntensityScale={1.5}
					liquid
					liquidStrength={0.12}
					liquidRadius={1.2}
					liquidWobbleSpeed={5}
					speed={0.6}
					edgeFade={0.25}
					transparent
				/>
			</div>

			{/* Header */}
			<header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6">
				<div className="flex items-center gap-2 text-white">
					<Rocket className="w-6 h-6" />
					<span className="text-lg font-medium relative">rocket</span>
				</div>

				<nav className="hidden md:flex items-center gap-8 text-sm text-white">
					<Button variant="ghost" className="">
						Products
					</Button>
					<Button variant="ghost" className="">
						Pricing
					</Button>
					<Button variant="ghost" className="">
						Careers
					</Button>
					<Button variant="ghost" className="flex items-center gap-1">
						Resources
						<ChevronDown className="w-4 h-4" />
					</Button>
				</nav>

				<Button
					variant="outline"
					className="bg-white text-black hover:bg-white/90"
				>
					Sign in
				</Button>
			</header>

			{/* Main */}
			<main className="relative z-10 flex flex-col justify-center px-6 pb-24 min-h-[calc(100vh-80px)]">
				<div className="max-w-4xl mx-auto w-full">
					{/* Banner */}
					<div className="flex justify-center mb-10">
						<div className="px-4 py-2 rounded-full bg-purple-500 border border-purple-500/30 text-sm text-white flex items-center gap-2">
							New Release
							<ArrowRight className="w-4 h-4" />
						</div>
					</div>

					{/* Hero */}
					<div className="text-center mb-14">
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4">
							Built anything
							<span className="animate-pulse">|</span>
						</h1>
						<p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
							Build production-ready{" "}
							<span className="font-semibold underline underline-offset-4">
								mobile app.
							</span>
						</p>
					</div>

					{/* Input */}
					<div className="max-w-3xl mx-auto">
						<div className="bg-white rounded-2xl border shadow-xl p-4">
							<Textarea
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder="What can I build for you today?"
								className="min-h-[140px] resize-none text-lg px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
							/>

							<div className="mt-4 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="icon">
										<Paperclip className="w-5 h-5" />
									</Button>
									<Button variant="secondary" size="sm" className="gap-1.5">
										<Upload className="w-4 h-4" />
										Import
									</Button>
								</div>

								<Button size="icon">
									<ArrowRight className="w-5 h-5" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
