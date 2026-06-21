import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { describe, expect, test } from "vitest";
import {
	applyRecipeFilters,
	createRecipeSearchIndex,
} from "./applyRecipeFilters";

function makeRecipe(
	id: string,
	name: string,
	overrides: Partial<RecipeWithRelations> = {},
): RecipeWithRelations {
	return {
		id,
		name,
		description: null,
		instructions: null,
		preparationMethod: null,
		dilutionTarget: null,
		glassware: null,
		ice: null,
		garnish: null,
		style: null,
		aiEnrichedFields: null,
		createdAt: "",
		createdBy: "",
		updatedAt: null,
		updatedBy: null,
		orgId: "org_test",
		lines: [],
		tags: [],
		...overrides,
	};
}

function tagRef(recipeId: string, tagId: string) {
	return {
		recipeId,
		tagId,
		orgId: "org_test",
		createdAt: "",
		tag: {
			id: tagId,
			name: tagId,
			orgId: "org_test",
			createdAt: "",
			updatedAt: null,
			createdBy: "",
			updatedBy: null,
		},
	};
}

const NEGRONI = makeRecipe("r1", "Negroni", {
	style: "martini" as const,
	tags: [tagRef("r1", "t-classic")],
});
const GIN_FIZZ = makeRecipe("r2", "Gin Fizz", {
	style: "fizz" as const,
	tags: [tagRef("r2", "t-classic"), tagRef("r2", "t-summer")],
});
const MARGARITA = makeRecipe("r3", "Margarita", {
	style: "sour" as const,
	tags: [tagRef("r3", "t-summer")],
});
const NEGRONI_SBAGLIATO = makeRecipe("r4", "Negroni Sbagliato", {
	style: "martini" as const,
	tags: [],
});

const RECIPES = [NEGRONI, GIN_FIZZ, MARGARITA, NEGRONI_SBAGLIATO];
const INDEX = createRecipeSearchIndex(RECIPES);

const NO_FILTERS = {
	query: "",
	favoriteIdSet: null,
	selectedTagIds: [],
	selectedStyles: [],
};

describe("applyRecipeFilters", () => {
	test("returns input reference when nothing is filtering", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, NO_FILTERS);
		expect(result).toBe(RECIPES);
	});

	test("filters by search query with prefix matches first", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			...NO_FILTERS,
			query: "negroni",
		});
		expect(result.map((r) => r.id)).toEqual(["r1", "r4"]);
	});

	test("filters by favorites when favoriteIdSet is non-null", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			...NO_FILTERS,
			favoriteIdSet: new Set(["r1", "r3"]),
		});
		expect(result.map((r) => r.id)).toEqual(["r1", "r3"]);
	});

	test("skips favorites filter when favoriteIdSet is null", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			...NO_FILTERS,
			favoriteIdSet: null,
		});
		expect(result).toBe(RECIPES);
	});

	test("filters by selected tag ids (OR semantics)", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			...NO_FILTERS,
			selectedTagIds: ["t-summer"],
		});
		expect(result.map((r) => r.id)).toEqual(["r2", "r3"]);
	});

	test("filters by selected styles", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			...NO_FILTERS,
			selectedStyles: ["martini"],
		});
		expect(result.map((r) => r.id)).toEqual(["r1", "r4"]);
	});

	test("supports null style in selectedStyles to keep recipes with no style", () => {
		const styleless = makeRecipe("r5", "Mystery", { style: null });
		const all = [...RECIPES, styleless];
		const result = applyRecipeFilters(all, createRecipeSearchIndex(all), {
			...NO_FILTERS,
			selectedStyles: [null],
		});
		expect(result.map((r) => r.id)).toEqual(["r5"]);
	});

	test("combines all filters (AND across filter types)", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			query: "negroni",
			favoriteIdSet: new Set(["r1", "r4"]),
			selectedTagIds: ["t-classic"],
			selectedStyles: ["martini"],
		});
		// r1 (Negroni) matches all four. r4 (Sbagliato) has the right style and is
		// favorited but lacks the "t-classic" tag, so AND across filter types rejects it.
		expect(result.map((r) => r.id)).toEqual(["r1"]);
	});

	test("returns empty array when no recipes match", () => {
		const result = applyRecipeFilters(RECIPES, INDEX, {
			...NO_FILTERS,
			query: "absinthe",
		});
		expect(result).toEqual([]);
	});

	test("with query, prefix matches precede substring matches", () => {
		// "fizz" is a substring of "Gin Fizz" but not a prefix.
		// Adding a recipe with name "Fizz Master" should appear before "Gin Fizz".
		const fizzMaster = makeRecipe("r6", "Fizz Master");
		const all = [GIN_FIZZ, fizzMaster];
		const result = applyRecipeFilters(all, createRecipeSearchIndex(all), {
			...NO_FILTERS,
			query: "fizz",
		});
		expect(result.map((r) => r.id)).toEqual(["r6", "r2"]);
	});
});
