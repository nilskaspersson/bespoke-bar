import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@upstash/redis", () => ({ Redis: class {} }));

const { createHandoffStore, HANDOFF_CLOSED } = await import("./handoffStore");
const { createFakeRedis } = await import("./handoffStore.testing");

const NOW = 1_700_000_000_000;
const EXPIRES_AT = NOW + 5 * 60_000;
const EXPIRE_AT = EXPIRES_AT + 2 * 60_000;
const NONCE = "n".repeat(22);
const KEY = `handoff:${NONCE}`;
const record = { orgId: "org_1", userId: "user_1", expiresAt: EXPIRES_AT };
const result = { extractedText: "Negroni\n30 ml gin" };

let redis: ReturnType<typeof createFakeRedis>;
let store: ReturnType<typeof createHandoffStore>;

beforeEach(() => {
	redis = createFakeRedis();
	store = createHandoffStore(redis);
});

describe("handoffStore", () => {
	it("reads null for an unknown nonce", async () => {
		expect(await store.read(NONCE)).toBeNull();
	});

	it("creates a record that reads back with expiry set", async () => {
		await store.create(NONCE, record, { expireAtMs: EXPIRE_AT });

		expect(await store.read(NONCE)).toEqual({ ...record, result: null });
		expect(redis.expiries.get(KEY)).toBe(Math.ceil(EXPIRE_AT / 1000));
	});

	it("lets the first result claim the Handoff and refuses the second", async () => {
		await store.create(NONCE, record, { expireAtMs: EXPIRE_AT });

		expect(await store.claimResult(NONCE, result)).toBe(true);
		expect(await store.claimResult(NONCE, { extractedText: "other" })).toBe(
			false,
		);
		expect((await store.read(NONCE))?.result).toEqual(result);
	});

	it("tombstones an unsettled Handoff so a later result is refused", async () => {
		await store.create(NONCE, record, { expireAtMs: EXPIRE_AT });

		expect(await store.close(NONCE)).toBe(true);
		expect(await store.claimResult(NONCE, result)).toBe(false);
		expect((await store.read(NONCE))?.result).toBe(HANDOFF_CLOSED);
	});

	it("does not overwrite a landed result with a tombstone", async () => {
		await store.create(NONCE, record, { expireAtMs: EXPIRE_AT });
		await store.claimResult(NONCE, result);

		expect(await store.close(NONCE)).toBe(false);
		expect((await store.read(NONCE))?.result).toEqual(result);
	});

	it("never recreates a record that has expired", async () => {
		expect(await store.claimResult(NONCE, result)).toBe(false);
		expect(await store.close(NONCE)).toBe(false);
		expect(
			await store.extend(NONCE, {
				expiresAt: EXPIRES_AT,
				expireAtMs: EXPIRE_AT,
			}),
		).toBe(false);
		expect(redis.hashes.has(KEY)).toBe(false);
	});

	it("keeps an extended expiry when a result lands afterwards", async () => {
		const extendedExpireAt = EXPIRE_AT + 5 * 60_000;
		await store.create(NONCE, record, { expireAtMs: EXPIRE_AT });
		await store.extend(NONCE, {
			expiresAt: EXPIRES_AT + 5 * 60_000,
			expireAtMs: extendedExpireAt,
		});

		await store.claimResult(NONCE, result);

		expect(redis.expiries.get(KEY)).toBe(Math.ceil(extendedExpireAt / 1000));
	});
});
