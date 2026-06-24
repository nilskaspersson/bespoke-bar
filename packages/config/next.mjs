const isDevelopment = process.env.NODE_ENV === "development";

export function buildCsp(extra = {}) {
	const directives = [
		["default-src", ["'self'"]],
		[
			"script-src",
			[
				"'self'",
				"'unsafe-inline'",
				...(isDevelopment ? ["'unsafe-eval'"] : []),
				...(extra.scriptSrc ?? []),
			],
		],
		["connect-src", ["'self'", ...(extra.connectSrc ?? [])]],
		["img-src", ["'self'", "blob:", "data:", ...(extra.imgSrc ?? [])]],
		["font-src", ["'self'", ...(extra.fontSrc ?? [])]],
		["worker-src", ["'self'", "blob:"]],
		["style-src", ["'self'", "'unsafe-inline'"]],
		...(extra.frameSrc ? [["frame-src", ["'self'", ...extra.frameSrc]]] : []),
		["object-src", ["'none'"]],
		["base-uri", ["'self'"]],
		["form-action", ["'self'"]],
		["frame-ancestors", ["'none'"]],
	];

	const csp = directives
		.map(([name, values]) => `${name} ${values.filter(Boolean).join(" ")}`)
		.join("; ");

	return isDevelopment ? csp : `${csp}; upgrade-insecure-requests`;
}

export function createNextConfig(opts) {
	const { transpilePackages, csp, experimental, ...rest } = opts;

	return {
		transpilePackages,
		async headers() {
			const securityHeaders = [
				{ key: "Content-Security-Policy", value: buildCsp(csp) },
			];

			// The `.app` TLD is itself on the browser HSTS preload list, so HTTPS
			// (incl. first visit) is already enforced for every *.app host — this
			// header is defense-in-depth. HSTS is ignored over plain HTTP, so only
			// emit it in prod where every response is TLS.
			if (!isDevelopment) {
				securityHeaders.push({
					key: "Strict-Transport-Security",
					value: "max-age=63072000; includeSubDomains",
				});
			}

			return [{ source: "/(.*)", headers: securityHeaders }];
		},
		devIndicators: { position: "bottom-right" },
		poweredByHeader: false,
		reactCompiler: !isDevelopment,
		cacheComponents: true,
		experimental: { useLightningcss: true, ...experimental },
		...rest,
	};
}
