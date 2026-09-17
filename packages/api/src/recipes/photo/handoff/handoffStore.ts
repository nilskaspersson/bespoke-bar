import { Redis } from "@upstash/redis";
import { z } from "zod";

export const HANDOFF_CLOSED = "closed";

/**
 * Every write carries the key's absolute expiry, or a write racing the TTL would
 * recreate the hash without an expiry. Values are strings throughout
 * (`automaticDeserialization` is off), which also leaves HGETALL as the raw
 * flat `[field, value, …]` reply.
 */
export type HandoffRedis = {
	hgetall: (key: string) => Promise<unknown[] | Record<string, unknown> | null>;
	/** HSET + EXPIREAT. */
	setFields: (
		key: string,
		fields: Record<string, string>,
		expireAtUnixSeconds: number,
	) => Promise<void>;
	/** HSETNX + EXPIREAT; true when the field was absent and is now set. */
	setFieldIfAbsent: (
		key: string,
		field: string,
		value: string,
		expireAtUnixSeconds: number,
	) => Promise<boolean>;
};

/** Both writes go in one pipeline, so each mutation is a single round trip. */
export function createUpstashHandoffRedis(redis: Redis): HandoffRedis {
	return {
		hgetall: (key) => redis.hgetall(key),
		async setFields(key, fields, expireAtUnixSeconds) {
			await redis
				.pipeline()
				.hset(key, fields)
				.expireat(key, expireAtUnixSeconds)
				.exec();
		},
		async setFieldIfAbsent(key, field, value, expireAtUnixSeconds) {
			const [set] = await redis
				.pipeline()
				.hsetnx(key, field, value)
				.expireat(key, expireAtUnixSeconds)
				.exec();

			return set === 1;
		},
	};
}

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
	return {
		async create(
			nonce: string,
			record: Pick<HandoffRecord, "orgId" | "userId" | "expiresAt">,
			{ expireAtMs }: { expireAtMs: number },
		): Promise<void> {
			await redis.setFields(
				key(nonce),
				{
					orgId: record.orgId,
					userId: record.userId,
					expiresAt: String(record.expiresAt),
				},
				toUnixSeconds(expireAtMs),
			);
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
			await redis.setFields(
				key(nonce),
				{ expiresAt: String(expiresAt) },
				toUnixSeconds(expireAtMs),
			);
		},

		/** False if a result or tombstone is already there. */
		claimResult(
			nonce: string,
			result: HandoffResult,
			{ expireAtMs }: { expireAtMs: number },
		): Promise<boolean> {
			return redis.setFieldIfAbsent(
				key(nonce),
				"result",
				JSON.stringify(result),
				toUnixSeconds(expireAtMs),
			);
		},

		/** Tombstone. False if a result already landed. */
		close(
			nonce: string,
			{ expireAtMs }: { expireAtMs: number },
		): Promise<boolean> {
			return redis.setFieldIfAbsent(
				key(nonce),
				"result",
				HANDOFF_CLOSED,
				toUnixSeconds(expireAtMs),
			);
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
				createUpstashHandoffRedis(
					new Redis({ url, token, automaticDeserialization: false }),
				),
			)
		: null;
