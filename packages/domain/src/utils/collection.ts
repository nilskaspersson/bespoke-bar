export function omit<T, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> {
	const result = { ...o };

	for (const key of keys) {
		delete result[key];
	}

	return result;
}

/**
 * Build a Map from an array, keyed by a value extracted from each item.
 */
export function indexBy<T>(
	items: readonly T[],
	getKey: (item: T) => string,
): Map<string, T> {
	const map = new Map<string, T>();
	for (const item of items) {
		map.set(getKey(item), item);
	}
	return map;
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

export function isEmpty(o: unknown): boolean {
	return o == null || o === "";
}

export function isObject(o: unknown): o is Record<PropertyKey, unknown> {
	return typeof o === "object" && o !== null && !Array.isArray(o);
}

export function pickRandom<T>(items: readonly [T, ...T[]]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function unique<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
}
