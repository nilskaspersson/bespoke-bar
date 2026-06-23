import type { NextConfig } from "next";

export type CspSources = {
	scriptSrc?: string[];
	connectSrc?: string[];
	imgSrc?: string[];
	fontSrc?: string[];
	frameSrc?: string[];
};

export function buildCsp(extra?: CspSources): string;

export function createNextConfig(
	opts: Partial<NextConfig> & {
		transpilePackages: string[];
		csp?: CspSources;
	},
): NextConfig;
