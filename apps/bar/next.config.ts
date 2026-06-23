import { createNextConfig } from "@bespoke/config/next";

export default createNextConfig({
	transpilePackages: [
		"@bespoke/schema",
		"@bespoke/domain",
		"@bespoke/db",
		"@bespoke/api",
		"@bespoke/ui",
	],
	csp: {
		scriptSrc: [
			"https://tidy-mole-83.clerk.accounts.dev",
			"https://challenges.cloudflare.com",
		],
		connectSrc: ["https://tidy-mole-83.clerk.accounts.dev"],
		imgSrc: ["https://img.clerk.com"],
		frameSrc: ["https://challenges.cloudflare.com"],
	},
	experimental: { authInterrupts: true },
	images: {
		remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
	},
});
