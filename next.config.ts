import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		inlineCss: true,
		useLightningcss: true,
		authInterrupts: true,
	},
};

export default nextConfig;
