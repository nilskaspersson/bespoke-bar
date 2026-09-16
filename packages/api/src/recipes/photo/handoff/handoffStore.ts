import { Redis } from "@upstash/redis";
import { z } from "zod";

export const HANDOFF_CLOSED = "closed";

/**
 * The bits of the Upstash client we use, so tests can pass a fake. Everything
 * is strings (`automaticDeserialization` is off), which also leaves HGETALL as
 * the raw flat `[field, value, …]` reply.
 */
export type HandoffRedis = {
	hset: (key: string, fields: Record<string, string>) => Promise<number>;
	hsetnx: (key: string, field: string, value: string) => Promise<0 | 1>;
	hgetall: (key: string) => Promise<unknown[] | Record<string, unknown> | null>;
	expireat: (key: string, unixSeconds: number) => Promise<0 | 1>;
};

const handoffResultSchema = z.object({ extractedText: z.string() });

export type HandoffResult = z.infer<typeof handoffResultSchema>;

const storedSchema = z.object({
	orgId: z.string().min(1),
	userId: z.string().min(1),
	expiresAt: z.coerce.number().int(),
	result: z.string().optional(),
});

export type HandoffRecord = {
	orgId: string;
	userId: string;
	/** Epoch ms. */
	expiresAt: number;
	result: HandoffResult | typeof HANDOFF_CLOSED | null;
};

function key(nonce: string): string {
	return `handoff:${nonce}`;
}

function toUnixSeconds(ms: number): number {
	return Math.ceil(ms / 1000);
}

function toHash(reply: unknown[] | Record<string, unknown> | null) {
	if (!reply) {
		return null;
	}
	if (!Array.isArray(reply)) {
		return reply;
	}

	const hash: Record<string, unknown> = {};
	for (let i = 0; i + 1 < reply.length; i += 2) {
		hash[String(reply[i])] = reply[i + 1];
	}

	return hash;
}

export function createHandoffStore(redis: HandoffRedis) {
	/**
	 * Re-applied on every write, otherwise a write racing the TTL would recreate
	 * the hash without one.
	 */
	async function touchExpiry(nonce: string, expireAtMs: number) {
		await redis.expireat(key(nonce), toUnixSeconds(expireAtMs));
	}

	return {
		async create(
			nonce: string,
			record: Pick<HandoffRecord, "orgId" | "userId" | "expiresAt">,
			{ expireAtMs }: { expireAtMs: number },
		): Promise<void> {
			await redis.hset(key(nonce), {
				orgId: record.orgId,
				userId: record.userId,
				expiresAt: String(record.expiresAt),
			});
			await touchExpiry(nonce, expireAtMs);
		},

		async read(nonce: string): Promise<HandoffRecord | null> {
			const raw = toHash(await redis.hgetall(key(nonce)));
			if (!raw || Object.keys(raw).length === 0) {
				return null;
			}

			const stored = storedSchema.parse(raw);
			const result =
				stored.result === undefined
					? null
					: stored.result === HANDOFF_CLOSED
						? HANDOFF_CLOSED
						: handoffResultSchema.parse(JSON.parse(stored.result));

			return {
				orgId: stored.orgId,
				userId: stored.userId,
				expiresAt: stored.expiresAt,
				result,
			};
		},

		/** Only on a record known to exist, else HSET would create a partial hash. */
		async extend(
			nonce: string,
			{ expiresAt, expireAtMs }: { expiresAt: number; expireAtMs: number },
		): Promise<void> {
			await redis.hset(key(nonce), { expiresAt: String(expiresAt) });
			await touchExpiry(nonce, expireAtMs);
		},

		/** False if a result or tombstone is already there. */
		async claimResult(
			nonce: string,
			result: HandoffResult,
			{ expireAtMs }: { expireAtMs: number },
		): Promise<boolean> {
			const claimed =
				(await redis.hsetnx(key(nonce), "result", JSON.stringify(result))) ===
				1;
			await touchExpiry(nonce, expireAtMs);

			return claimed;
		},

		/** Tombstone. False if a result already landed. */
		async close(
			nonce: string,
			{ expireAtMs }: { expireAtMs: number },
		): Promise<boolean> {
			const closed =
				(await redis.hsetnx(key(nonce), "result", HANDOFF_CLOSED)) === 1;
			await touchExpiry(nonce, expireAtMs);

			return closed;
		},
	};
}

export type HandoffStore = ReturnType<typeof createHandoffStore>;

const url = process.env.UPSTASH_KV_REST_API_URL;
const token = process.env.UPSTASH_KV_REST_API_TOKEN;

/** null without Upstash config, which disables handoff altogether. */
export const handoffStore: HandoffStore | null =
	url && token
		? createHandoffStore(
				new Redis({ url, token, automaticDeserialization: false }),
			)
		: null;
