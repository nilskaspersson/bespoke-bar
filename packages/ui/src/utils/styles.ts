import type { CSSProperties } from "react";

/**
 * Reads a CSS custom property from the document root. Returns "" on the
 * server. Use to bridge values defined in theme CSS files into JavaScript
 * callers like the Web Animations API, whose options object is not a CSS
 * context and doesn't resolve `var()`.
 */
export function readCssVar(name: string): string {
	if (typeof window === "undefined") return "";
	return getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
}

/**
 * Prefix provided object's keys with a double-dash. Use to convert an object to an
 * inline CSS Variables declaration. Drops undefined values.
 *
 * Example:
 * `{ gap: "1rem" }` -> `{ "--gap": "1rem" }`
 */
export function toCSSVars(
	props: Record<string, string | number | undefined> | undefined,
): CSSProperties | undefined {
	if (!props) {
		return undefined;
	}

	let result: Record<string, string | number> | undefined;

	for (const key of Object.keys(props)) {
		const value = props[key];

		if (value !== undefined) {
			result ??= {};
			result[`--${key}`] = value;
		}
	}

	return result;
}

export function mergeStyleSources(
	...sources: Array<CSSProperties | undefined>
): CSSProperties | undefined {
	if (sources.every((source) => source === undefined)) {
		return undefined;
	}

	return Object.assign({}, ...sources);
}
