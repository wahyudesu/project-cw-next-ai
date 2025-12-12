// build.ts
import { defaultBuildLogger, Template } from "e2b";
import { template as nextJSTemplate } from "./template";

Template.build(nextJSTemplate, {
	alias: "nextjs-app-bun-2",
	cpuCount: 4,
	memoryMB: 4096,
	onBuildLogs: defaultBuildLogger(),
});
