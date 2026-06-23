import { createNextConfig } from "@bespoke/config/next";

/**
 * Clerk encodes its Frontend API host inside the publishable key
 * (`pk_(test|live)_<base64(host + "$")>`), so the CSP allows exactly the Clerk
 * instance in use..
 */
function clerkFrontendApi(): string {
	const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
	const host = Buffer.from(key.replace(/^pk_(test|live)_/, ""), "base64")
		.toString("utf8")
		.replace(/\$$/, "");

	return host ? `https://${host}` : "";
}

const clerk = clerkFrontendApi();

export default createNextConfig({
	transpilePackages: [
		"@bespoke/schema",
		"@bespoke/domain",
		"@bespoke/db",
		"@bespoke/api",
		"@bespoke/ui",
	],
	csp: {
		scriptSrc: [clerk, "https://challenges.cloudflare.com"],
		connectSrc: [clerk],
		imgSrc: ["https://img.clerk.com"],
		frameSrc: ["https://challenges.cloudflare.com"],
	},
	experimental: { authInterrupts: true },
	images: {
		remotePatterns: [{ protocol: "https", hostname: "img.clerk.com" }],
	},
});
