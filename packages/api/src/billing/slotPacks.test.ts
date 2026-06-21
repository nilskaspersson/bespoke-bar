import { afterEach, describe, expect, test, vi } from "vitest";
import { getSlotPacks } from "./slotPacks";

describe("getSlotPacks", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test("parses priceId:slotAmount pairs, tolerating spaces and a trailing comma", () => {
		vi.stubEnv("STRIPE_SLOT_PACK_PRICE_IDS", "price_a:25, price_b:100,");

		expect(getSlotPacks()).toEqual([
			{ priceId: "price_a", slotAmount: 25 },
			{ priceId: "price_b", slotAmount: 100 },
		]);
	});

	test("unset means no packs", () => {
		vi.stubEnv("STRIPE_SLOT_PACK_PRICE_IDS", "");

		expect(getSlotPacks()).toEqual([]);
	});

	test("an entry without an amount names itself and the expected format", () => {
		vi.stubEnv("STRIPE_SLOT_PACK_PRICE_IDS", "price_a");

		expect(() => getSlotPacks()).toThrowError(/"price_a".*priceId:slotAmount/s);
	});

	test("a Product id is rejected with a pointer to Price ids", () => {
		vi.stubEnv("STRIPE_SLOT_PACK_PRICE_IDS", "prod_abc:25");

		expect(() => getSlotPacks()).toThrowError(/Price id/);
	});

	test("a duplicate price id fails loudly instead of silently shadowing", () => {
		vi.stubEnv("STRIPE_SLOT_PACK_PRICE_IDS", "price_a:25,price_a:100");

		expect(() => getSlotPacks()).toThrowError(/Duplicate price id "price_a"/);
	});
});
