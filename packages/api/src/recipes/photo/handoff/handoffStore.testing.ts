import type { HandoffRedis } from "./handoffStore";

type Hash = Map<string, string>;

/** In-memory stand-in for the Upstash client. */
export function createFakeRedis() {
	const hashes = new Map<string, Hash>();
	const expiries = new Map<string, number>();

	function hash(key: string): Hash {
		const existing = hashes.get(key) ?? new Map<string, string>();
		hashes.set(key, existing);
		return existing;
	}

	const redis: HandoffRedis = {
		async hset(key, fields) {
			const target = hash(key);
			for (const [field, value] of Object.entries(fields)) {
				target.set(field, value);
			}
			return Object.keys(fields).length;
		},
		async hsetnx(key, field, value) {
			const target = hash(key);
			if (target.has(field)) return 0;
			target.set(field, value);
			return 1;
		},
		async hgetall(key) {
			const target = hashes.get(key);
			return target ? Object.fromEntries(target) : null;
		},
		async expireat(key, unixSeconds) {
			if (!hashes.has(key)) return 0;
			expiries.set(key, unixSeconds);
			return 1;
		},
	};

	return {
		...redis,
		hashes,
		expiries,
		reset() {
			hashes.clear();
			expiries.clear();
		},
	};
}
