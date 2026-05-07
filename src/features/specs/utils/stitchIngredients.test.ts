import { describe, expect, test } from "vitest";
import type { Ingredient } from "@/db/schema/ingredients";
import type { Spec } from "@/db/schema/specs";
import { buildIngredientMap, stitchSpecs } from "./stitchIngredients";

const ingredient = (
	id: string,
	overrides: Partial<Ingredient> = {},
): Ingredient => ({
	id,
	name: `Ingredient ${id}`,
	description: null,
	category: null,
	abv: null,
	brand: null,
	unitCost: null,
	measurementType: null,
	orgId: "org1",
	createdAt: "2026-01-01T00:00:00Z",
	createdBy: "user1",
	updatedAt: null,
	updatedBy: null,
	aiEnrichedFields: null,
	...overrides,
});

const spec = (ingredientId: string, overrides: Partial<Spec> = {}): Spec => ({
	id: `spec-${ingredientId}`,
	recipeId: "recipe1",
	quantity: 1,
	unit: "cl",
	ingredientId,
	createdAt: "2026-01-01T00:00:00Z",
	optional: false,
	...overrides,
});

describe("buildIngredientMap", () => {
	test("indexes ingredients by id", () => {
		const map = buildIngredientMap([ingredient("a"), ingredient("b")]);

		expect(map.get("a")?.name).toBe("Ingredient a");
		expect(map.get("b")?.name).toBe("Ingredient b");
		expect(map.size).toBe(2);
	});
});

describe("stitchSpecs", () => {
	test("attaches the matching ingredient to each spec", () => {
		const map = buildIngredientMap([ingredient("vodka"), ingredient("lime")]);

		const stitched = stitchSpecs([spec("vodka"), spec("lime")], map);

		expect(stitched).toHaveLength(2);
		expect(stitched[0].ingredient.name).toBe("Ingredient vodka");
		expect(stitched[1].ingredient.name).toBe("Ingredient lime");
	});

	test("preserves spec fields when stitching", () => {
		const map = buildIngredientMap([ingredient("vodka")]);
		const original = spec("vodka", { quantity: 2.5, optional: true });

		const [stitched] = stitchSpecs([original], map);

		expect(stitched.quantity).toBe(2.5);
		expect(stitched.optional).toBe(true);
		expect(stitched.id).toBe(original.id);
	});

	test("falls back to a placeholder ingredient when missing from map", () => {
		const map = buildIngredientMap([]);

		const [stitched] = stitchSpecs([spec("missing")], map);

		expect(stitched.ingredient.id).toBe("missing");
		expect(stitched.ingredient.name).toBe("Unknown ingredient");
	});
});
