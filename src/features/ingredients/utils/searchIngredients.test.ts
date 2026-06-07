import { describe, expect, it } from "vitest";
import type { Ingredient } from "@/db/schema/ingredients";
import {
	createIngredientSearchIndex,
	filterIngredientsByQuery,
} from "./searchIngredients";

function make(overrides: Partial<Ingredient> & { id: string }): Ingredient {
	return {
		name: overrides.id,
		brand: null,
		category: null,
		...overrides,
	} as Ingredient;
}

const TANQUERAY = make({
	id: "i1",
	name: "Tanqueray",
	category: "gin",
	brand: "Tanqueray",
});
const CAMPARI = make({ id: "i2", name: "Campari", category: "amaro" });
const LIME = make({ id: "i3", name: "Lime Juice", category: "citrus" });
const LEBLON = make({
	id: "i4",
	name: "Leblon",
	category: "cachaca",
	brand: "Leblon",
});

const INGREDIENTS = [TANQUERAY, CAMPARI, LIME, LEBLON];
const INDEX = createIngredientSearchIndex(INGREDIENTS);

const ids = (list: Ingredient[]) => list.map((ingredient) => ingredient.id);

describe("filterIngredientsByQuery", () => {
	it("returns the input by reference for an empty or blank query", () => {
		expect(filterIngredientsByQuery(INGREDIENTS, INDEX, "")).toBe(INGREDIENTS);
		expect(filterIngredientsByQuery(INGREDIENTS, INDEX, "   ")).toBe(
			INGREDIENTS,
		);
	});

	it("matches by name", () => {
		expect(ids(filterIngredientsByQuery(INGREDIENTS, INDEX, "camp"))).toEqual([
			"i2",
		]);
	});

	it("matches by category label, not just name", () => {
		// "gin" is Tanqueray's category, never appears in its name.
		expect(ids(filterIngredientsByQuery(INGREDIENTS, INDEX, "gin"))).toEqual([
			"i1",
		]);
	});

	it("matches by brand", () => {
		expect(ids(filterIngredientsByQuery(INGREDIENTS, INDEX, "leblon"))).toEqual(
			["i4"],
		);
	});

	it("folds accents in indexed fields via normalizeInput", () => {
		// Category label is "Cachaça"; the ASCII-folded query still matches.
		expect(
			ids(filterIngredientsByQuery(INGREDIENTS, INDEX, "cachaca")),
		).toEqual(["i4"]);
	});

	it("does not match across field boundaries", () => {
		// Lime indexes as "lime juice\0citrus"; a query spanning the NUL must not hit.
		expect(filterIngredientsByQuery(INGREDIENTS, INDEX, "juicecitrus")).toEqual(
			[],
		);
	});
});
