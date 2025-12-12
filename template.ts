import { Template } from "e2b";

export const template = Template()
	.fromImage("node:21-slim")
	.setUser("root")
	.setWorkdir("/")
	.runCmd(
		"apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*",
	)
	.copy("compile_page.sh", "/compile_page.sh")
	.runCmd("chmod +x /compile_page.sh")
	.setWorkdir("/home/user/nextjs-app")
	.runCmd("npx --yes create-next-app@15.5.7 . --yes")
	.runCmd("npx --yes shadcn@3.5.2 init --yes -b neutral --force")
	.runCmd("npx --yes shadcn@3.5.2 add --all --yes")
	.runCmd(
		"mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app",
	)
	.setUser("user")
	.setWorkdir("/home/user");
