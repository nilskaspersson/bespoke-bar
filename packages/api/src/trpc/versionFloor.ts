import { get } from "@vercel/edge-config";
import { cache } from "react";
import { z } from "zod";

const clientPlatformSchema = z.enum(["ios", "android"]);

export type ClientPlatform = z.infer<typeof clientPlatformSchema>;

/**
 * The app cohort a request identifies as (ADR-0009). Web clients send neither
 * header, so both fields are `null` and the version floor never judges them.
 */
export type ClientContext = {
	platform: ClientPlatform | null;
	version: string | null;
};

export function readClientHeaders(headers?: Headers): ClientContext {
	if (!headers) {
		return { platform: null, version: null };
	}

	const platform = clientPlatformSchema.safeParse(headers.get("x-platform"));
	const version = headers.get("x-app-version");

	return {
		platform: platform.success ? platform.data : null,
		version: version && version.trim() !== "" ? version : null,
	};
}

/**
 * Per-platform min-version floor, read from Edge Config with the same
 * `get<string>()` pattern as the admin allowlist. Wrapped in React `cache()`
 * (the `rateLimit` pattern) so a batched request reading several procedures
 * hits Edge Config once per platform.
 *
 * Fail-open, matching `rateLimit`'s posture: a missing key, unreadable value,
 * or Edge Config outage returns `null` (allow). The floor is an ops lever, not
 * a security boundary — an outage must not brick every phone.
 */
export const getMinAppVersion = cache(
	async (platform: ClientPlatform): Promise<string | null> => {
		try {
			const value = await get<unknown>(`min-app-version-${platform}`);
			return typeof value === "string" ? value : null;
		} catch (error) {
			console.warn("Version floor read failed, allowing request:", error);
			return null;
		}
	},
);

function parseVersion(value: string): number[] | null {
	const segments = value
		.split(".")
		.map((segment) => (segment.trim() === "" ? Number.NaN : Number(segment)));
	return segments.every((n) => Number.isInteger(n) && n >= 0) ? segments : null;
}

/**
 * Dot-split numeric comparison, no dependency. An unparseable version or floor
 * counts as *not* below floor (fail-open) — a garbled `x-app-version` or a
 * fat-fingered Edge Config value must never wall a client on its own.
 */
export function isBelowFloor(version: string, floor: string): boolean {
	const v = parseVersion(version);
	const f = parseVersion(floor);
	if (!v || !f) {
		return false;
	}

	const length = Math.max(v.length, f.length);
	for (let i = 0; i < length; i++) {
		const a = v[i] ?? 0;
		const b = f[i] ?? 0;
		if (a !== b) {
			return a < b;
		}
	}
	return false;
}
