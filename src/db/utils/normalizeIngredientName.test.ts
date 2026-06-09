import { describe, expect, test } from "vitest";
import { insertIngredientSchema } from "@/db/schema/ingredients";
import { normalizeIngredientName } from "@/utils/normalizeIngredientName";

/**
 * `normalizeIngredientName` is the single source of truth for ingredient identity:
 * its output is persisted to `normalized_name` and compared by the unique index
 * verbatim. These tests pin the canonical behavior so the write side and the
 * find-or-reference lookup can never disagree.
 */
describe("normalizeIngredientName", () => {
	test("is case-insensitive", () => {
		expect(normalizeIngredientName("Gin")).toBe("gin");
		expect(normalizeIngredientName("GIN")).toBe("gin");
	});

	test("trims surrounding whitespace, including tabs and newlines", () => {
		expect(normalizeIngredientName(" Gin ")).toBe("gin");
		expect(normalizeIngredientName("Gin\t")).toBe("gin");
		expect(normalizeIngredientName("\nGin")).toBe("gin");
	});

	test("preserves interior spacing", () => {
		expect(normalizeIngredientName(" Simple Syrup ")).toBe("simple syrup");
	});

	test("is idempotent, including locale-sensitive input", () => {
		for (const name of ["Gin", " Vodka ", "İstanbul", "ΟΔΟΣ"]) {
			const once = normalizeIngredientName(name);
			expect(normalizeIngredientName(once)).toBe(once);
		}
	});
});

describe("insertIngredientSchema", () => {
	test("derives normalizedName from name so callers never pass it", () => {
		const parsed = insertIngredientSchema.parse({
			name: "  Sipsmith Gin ",
			orgId: "org_1",
			createdBy: "user_1",
		});

		expect(parsed.normalizedName).toBe("sipsmith gin");
	});
});
