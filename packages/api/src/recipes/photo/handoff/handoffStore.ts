import { Redis } from "@upstash/redis";
import { z } from "zod";

export const HANDOFF_CLOSED = "closed";

/**
 * Only `create` may bring a key into existence, atomically with its expiry.
 */
export type HandoffRedis = {
	hgetall: (key: string) => Promise<unknown[] | Record<string, unknown> | null>;
	/** HSET + EXPIREAT in one transaction. */
	create: (
		key: string,
		fields: Record<string, string>,
		expireAtUnixSeconds: number,
	) => Promise<void>;
	/** HSET + EXPIREAT; false when the key is gone. */
	setFieldsIfExists: (
		key: string,
		fields: Record<string, string>,
		expireAtUnixSeconds: number,
	) => Promise<boolean>;
	/**
	 * HSETNX that leaves the expiry alone; true when the key exists and the
	 * field was absent.
	 */
	setFieldIfAbsent: (
		key: string,
		field: string,
		value: string,
	) => Promise<boolean>;
};

const SET_FIELDS_IF_EXISTS = `
	if redis.call("EXISTS", KEYS[1]) == 0 then
		return 0
	end
	redis.call("HSET", KEYS[1], unpack(ARGV, 2))
	redis.call("EXPIREAT", KEYS[1], ARGV[1])
	return 1
`;

const SET_FIELD_IF_ABSENT = `
	if redis.call("EXISTS", KEYS[1]) == 0 then
		return 0
	end
	return redis.call("HSETNX", KEYS[1], ARGV[1], ARGV[2])
`;

export function createUpstashHandoffRedis(redis: Redis): HandoffRedis {
	const setFieldsIfExists = redis.createScript<number>(SET_FIELDS_IF_EXISTS);
	const setFieldIfAbsent = redis.createScript<number>(SET_FIELD_IF_ABSENT);

	return {
		hgetall: (key) => redis.hgetall(key),
		async create(key, fields, expireAtUnixSeconds) {
			await redis
				.multi()
				.hset(key, fields)
				.expireat(key, expireAtUnixSeconds)
				.exec();
		},
		async setFieldsIfExists(key, fields, expireAtUnixSeconds) {
			const set = await setFieldsIfExists.exec(
				[key],
				[String(expireAtUnixSeconds), ...Object.entries(fields).flat()],
			);

			return Number(set) === 1;
		},
		async setFieldIfAbsent(key, field, value) {
			const set = await setFieldIfAbsent.exec([key], [field, value]);

			return Number(set) === 1;
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
			await redis.create(
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

		/** False if the record expired in the meantime. */
		extend(
			nonce: string,
			{ expiresAt, expireAtMs }: { expiresAt: number; expireAtMs: number },
		): Promise<boolean> {
			return redis.setFieldsIfExists(
				key(nonce),
				{ expiresAt: String(expiresAt) },
				toUnixSeconds(expireAtMs),
			);
		},

		/** False if a result or tombstone is already there, or the record expired. */
		claimResult(nonce: string, result: HandoffResult): Promise<boolean> {
			return redis.setFieldIfAbsent(
				key(nonce),
				"result",
				JSON.stringify(result),
			);
		},

		/** Tombstone. False if a result already landed, or the record expired. */
		close(nonce: string): Promise<boolean> {
			return redis.setFieldIfAbsent(key(nonce), "result", HANDOFF_CLOSED);
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
