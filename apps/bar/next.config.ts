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
  ${isDevelopment ? "" : "upgrade-insecure-requests;"}
`;

const nextConfig: NextConfig = {
	transpilePackages: [
		"@bespoke/schema",
		"@bespoke/domain",
		"@bespoke/db",
		"@bespoke/api",
	],
	async headers() {
		const securityHeaders = [
			{
				key: "Content-Security-Policy",
				value: cspHeader.replace(/\n/g, ""),
			},
		];

		// The `.app` TLD is itself on the browser HSTS preload list, so HTTPS
		// (incl. first visit) is already enforced for every *.app host — this
		// header is defense-in-depth. HSTS is ignored over plain HTTP, so only
		// emit it in prod where every response is TLS. No `preload` directive /
		// hstspreload.org submission needed: the TLD already covers us.
		if (!isDevelopment) {
			securityHeaders.push({
				key: "Strict-Transport-Security",
				value: "max-age=63072000; includeSubDomains",
			});
		}

		return [
			{
				source: "/(.*)",
				headers: securityHeaders,
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
	devIndicators: { position: "bottom-right" },
	poweredByHeader: false,
	reactCompiler: !isDevelopment,
	cacheComponents: true,
	experimental: {
		authInterrupts: true,
		useLightningcss: true,
	},
};

export default nextConfig;
