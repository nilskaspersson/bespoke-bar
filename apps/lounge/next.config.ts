import { createNextConfig } from "@bespoke/config/next";

const blobHost = new URL(process.env.NEXT_PUBLIC_BLOB_BASE_URL ?? "").hostname;

export default createNextConfig({
	transpilePackages: ["@bespoke/ui", "@bespoke/domain", "@bespoke/schema"],
	images: {
		remotePatterns: [{ protocol: "https", hostname: blobHost }],
	},
});
