export {
	indexBy,
	isEmpty,
	pick,
	unique,
} from "@bespoke/domain/utils/collection";
export { round } from "@bespoke/domain/utils/math";
export { asciiFold, normalizeInput } from "@bespoke/domain/utils/text";

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

export function pickRandom<T>(items: readonly [T, ...T[]]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function times(n: number): number[] {
	return Array.from({ length: n }, (_, i) => i);
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
