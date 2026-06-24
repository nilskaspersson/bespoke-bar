import type { AppRouter } from "@bespoke/api/trpc/routers/_app";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient() {
	return trpc.createClient({
		links: [
			httpBatchLink({
				url: "/api/trpc",
			}),
		],
	});
}
