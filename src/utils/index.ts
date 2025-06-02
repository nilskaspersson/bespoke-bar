export function compose<T>(fn: (a: T) => T, ...fns: Array<(a: T) => T>) {
	return fns.reduce((prev, next) => (v) => prev(next(v)), fn);
}

export function pipe<T>(fn: (a: T) => T, ...fns: Array<(a: T) => T>) {
	return fns.reduce((prev, next) => (v) => next(prev(v)), fn);
}

export function omit<T, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> {
	const result = { ...o };

	for (const key of keys) {
		delete result[key];
	}

	return result;
}

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param string - The string to escape.
 * @returns The escaped string.
 */
export function escapeRegex(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function invertMapToSets<T>(map: Map<string, T>): Map<T, Set<string>> {
	const inverted = new Map<T, Set<string>>();

	for (const [alias, value] of map) {
		if (!inverted.has(value)) {
			inverted.set(value, new Set());
		}

		inverted.get(value)?.add(alias);
	}

	return inverted;
}

export function isUndefined(o: unknown): o is undefined {
	return typeof o === "undefined";
}
