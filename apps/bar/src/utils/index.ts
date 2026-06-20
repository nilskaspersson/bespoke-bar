/** @public */
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

/** @public */
export function clamp(n: number, min: number, max: number): number {
	return Math.min(Math.max(n, min), max);
}

/** @public */
export function debounce<Args extends unknown[]>(
	fn: (...args: Args) => void,
	wait: number,
	{
		leading = false,
		trailing = true,
	}: {
		leading?: boolean;
		trailing?: boolean;
	} = {},
): ((...args: Args) => void) & { cancel: () => void } {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let trailingArgs: Args | null = null;

	function debounced(...args: Args): void {
		if (timer === null && leading) {
			fn(...args);
		} else {
			trailingArgs = args;
		}

		if (timer !== null) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			timer = null;
			if (trailing && trailingArgs !== null) {
				fn(...trailingArgs);
				trailingArgs = null;
			}
		}, wait);
	}

	debounced.cancel = () => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = null;
		trailingArgs = null;
	};

	return debounced;
}

export function round(value: number, decimals = 2): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
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

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param string - The string to escape.
 * @returns The escaped string.
 */
export function escapeRegex(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** @public */
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

/**
 * Unicode "Combining Diacritical Marks" block (U+0300 to U+036F).
 * Used to strip accents after NFKD normalization decomposes characters
 * like "é" into "e" + combining acute accent.
 */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/**
 * Fold a string to its ASCII-comparable form: strip diacritics and map typographic
 * punctuation (curly quotes, en/em dashes) to ASCII equivalents.
 */
const NON_ASCII = /\P{ASCII}/u;

/** @public */
export function asciiFold(s: string): string {
	// Fast path: skip normalize + regex if pure ASCII
	if (!NON_ASCII.test(s)) return s;

	return s
		.normalize("NFKD")
		.replaceAll(COMBINING_MARKS, "")
		.replaceAll(/[‘’‚‛′ʼ]/g, "'")
		.replaceAll(/[“”„‟]/g, '"')
		.replaceAll(/[–—]/g, "-");
}

export function normalizeInput(s: string): string {
	return asciiFold(s).toLowerCase().trim();
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

export function pickRandom<T>(items: readonly [T, ...T[]]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function times(n: number): number[] {
	return Array.from({ length: n }, (_, i) => i);
}

export function unique<T>(items: Iterable<T>): T[] {
	return Array.from(new Set(items));
}

/** @public */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isObject(o: unknown): o is Record<PropertyKey, unknown> {
	return typeof o === "object" && o !== null && !Array.isArray(o);
}

export function getDifferentKeys<T extends Record<PropertyKey, unknown>>(
	a: T,
	b: T,
): (keyof T)[] {
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

	const diff: (keyof T)[] = [];

	for (const k of keys) {
		if (a[k] !== b[k]) {
			diff.push(k);
		}
	}

	return diff;
}

export function noop() {}
