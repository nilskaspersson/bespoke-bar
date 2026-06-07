import { describe, expect, it } from "vitest";
import type { Ingredient } from "@/db/schema/ingredients";
import {
	ingredientSortDirectionSchema,
	ingredientSortFieldSchema,
	sortIngredients,
} from "./sortIngredients";

function make(
	name: string,
	createdAt: string,
	updatedAt: string | null = null,
): Ingredient {
	return { id: name, name, createdAt, updatedAt } as Ingredient;
}

const names = (list: Ingredient[]) => list.map((ingredient) => ingredient.name);

describe("sortIngredients", () => {
	it("sorts by name with a case-insensitive collator", () => {
		const list = [
			make("banana", "2024-01-01"),
			make("Apple", "2024-01-01"),
			make("cherry", "2024-01-01"),
		];

		expect(names(sortIngredients(list, "name", "asc"))).toEqual([
			"Apple",
			"banana",
			"cherry",
		]);
		expect(names(sortIngredients(list, "name", "desc"))).toEqual([
			"cherry",
			"banana",
			"Apple",
		]);
	});

	it("sorts by created date, with desc as newest-first", () => {
		const list = [
			make("old", "2024-01-01T00:00:00Z"),
			make("new", "2024-03-01T00:00:00Z"),
			make("mid", "2024-02-01T00:00:00Z"),
		];

		expect(names(sortIngredients(list, "created", "desc"))).toEqual([
			"new",
			"mid",
			"old",
		]);
		expect(names(sortIngredients(list, "created", "asc"))).toEqual([
			"old",
			"mid",
			"new",
		]);
	});

	it("falls back to createdAt when updatedAt is null", () => {
		const edited = make(
			"edited",
			"2024-01-01T00:00:00Z",
			"2024-05-01T00:00:00Z",
		);
		const neverEdited = make("fresh", "2024-04-01T00:00:00Z", null);

		expect(
			names(sortIngredients([neverEdited, edited], "updated", "desc")),
		).toEqual(["edited", "fresh"]);
	});

	it("breaks date ties by name, ascending regardless of direction", () => {
		const list = [make("Zinfandel", "2024-01-01"), make("Amaro", "2024-01-01")];

		expect(names(sortIngredients(list, "created", "asc"))).toEqual([
			"Amaro",
			"Zinfandel",
		]);
		expect(names(sortIngredients(list, "created", "desc"))).toEqual([
			"Amaro",
			"Zinfandel",
		]);
	});

	it("does not mutate the input array", () => {
		const list = [make("b", "2024-01-02"), make("a", "2024-01-01")];
		const snapshot = [...list];

		sortIngredients(list, "name", "asc");

		expect(list).toEqual(snapshot);
	});
});

describe("ingredient sort schemas", () => {
	it("expose their options for the URL parser and UI", () => {
		expect(ingredientSortFieldSchema.options).toEqual([
			"created",
			"updated",
			"name",
		]);
		expect(ingredientSortDirectionSchema.options).toEqual(["asc", "desc"]);
	});

	it("reject unknown values", () => {
		expect(ingredientSortFieldSchema.safeParse("bogus").success).toBe(false);
		expect(ingredientSortDirectionSchema.safeParse("up").success).toBe(false);
	});
});
