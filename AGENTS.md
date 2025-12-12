# Agent Guidelines for cw-next-ai

## Build Commands
- `bun dev` - Start development server with Turbopack
- `bun run build` - Build for production  
- `bun run lint` - Run Biome linter
- `bun run lint:fix` - Fix linting issues automatically
- `bun run format` - Format code with Biome
- `bun run check` - Run Biome check with auto-fix
- Test commands: Check package.json for test scripts (none currently configured)

## Code Style Guidelines
- **Formatting**: Use Biome with tab indentation, double quotes for strings
- **Imports**: Use `@/*` path aliases for src directory imports
- **TypeScript**: Strict mode enabled, use proper type annotations
- **Components**: Follow shadcn/ui patterns with cva for variants
- **tRPC**: Use createTRPCRouter pattern, export types for client
- **Styling**: Tailwind CSS v4 with CSS modules support
- **File structure**: Server code in `src/server/`, client components in `src/components/`
- **Error handling**: Use proper TypeScript error types, avoid any
- **Naming**: PascalCase for components, camelCase for functions/variables