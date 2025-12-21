import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ""} https://tidy-mole-83.clerk.accounts.dev https://challenges.cloudflare.com;
  connect-src 'self' https://tidy-mole-83.clerk.accounts.dev;
  img-src 'self' blob: data: https://img.clerk.com;
  font-src 'self';
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  frame-src 'self' https://challenges.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Content-Security-Policy",
						value: cspHeader.replace(/\n/g, ""),
					},
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.clerk.com",
			},
		],
	},
	devIndicators: false,
	poweredByHeader: false,
	reactCompiler: true,
	experimental: {
		authInterrupts: true,
		inlineCss: true,
		useCache: true,
		useLightningcss: true,
		viewTransition: true,
		serverActions: {
			/**
			 * TODO: Remove once parseTextFromImage is migrated to API route.
			 */
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
