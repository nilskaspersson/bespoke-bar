import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ""};
  connect-src 'self';
  img-src 'self' blob: data:;
  font-src 'self';
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isDevelopment ? "" : "upgrade-insecure-requests;"}
`;

const nextConfig: NextConfig = {
	transpilePackages: ["@bespoke/ui", "@bespoke/domain", "@bespoke/schema"],
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
	devIndicators: { position: "bottom-right" },
	poweredByHeader: false,
	reactCompiler: !isDevelopment,
	cacheComponents: true,
	experimental: {
		useLightningcss: true,
	},
};

export default nextConfig;
