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
		async hgetall(key) {
			const target = hashes.get(key);
			return target ? Array.from(target.entries()).flat() : [];
		},
		async setFields(key, fields, expireAtUnixSeconds) {
			const target = hash(key);
			for (const [field, value] of Object.entries(fields)) {
				target.set(field, value);
			}
			expiries.set(key, expireAtUnixSeconds);
		},
		async setFieldIfAbsent(key, field, value, expireAtUnixSeconds) {
			const target = hash(key);
			const absent = !target.has(field);
			if (absent) {
				target.set(field, value);
			}
			expiries.set(key, expireAtUnixSeconds);
			return absent;
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
