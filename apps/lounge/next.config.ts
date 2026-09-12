import { createNextConfig } from "@bespoke/config/next";

const blobBaseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL;

export default createNextConfig({
	transpilePackages: ["@bespoke/ui", "@bespoke/domain", "@bespoke/schema"],
	images: {
		remotePatterns: blobBaseUrl
			? [{ protocol: "https", hostname: new URL(blobBaseUrl).hostname }]
			: [],
	},
});
