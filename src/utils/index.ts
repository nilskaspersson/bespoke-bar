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

export function pick<T extends Record<PropertyKey, unknown>, K extends keyof T>(
	o: T,
	...keys: K[]
): Pick<T, K> {
	const result = {} as Pick<T, K>;

	for (const key of keys) {
		if (key in o) {
			result[key] = o[key];
		}
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

export function deburr(
	s: string | undefined | null,
): string | undefined | null {
	return typeof s === "string" &&
		typeof String.prototype.normalize === "function"
		? s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
		: s;
}

export function normalizeInput(name: string): string {
	const deburred = deburr(name) || name;
	return deburred.toLowerCase().trim();
}

/**
 * Inverts a Map<K, V[]> to Map<V, K> for one-to-one lookups
 * Assumes each value appears only once.
 */
export function invertMapToLookup<K, V>(map: Map<K, V[]>): Map<V, K> {
	const result = new Map<V, K>();

	for (const [key, values] of map.entries()) {
		for (const value of values) {
			result.set(value, key);
		}
	}

	return result;
}

export function times(n: number): number[] {
	return Array.from({ length: n }, (_, i) => i);
}
