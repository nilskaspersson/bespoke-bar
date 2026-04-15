import { describe, expect, test } from "vitest";
import { buildIngredientIndex } from "@/features/ingredients/utils/buildIngredientIndex";
import { MOCK_INGREDIENTS } from "@/mocks/data/ingredients";
import { tokenizeLine } from "./tokenizeLine";

const index = buildIngredientIndex(MOCK_INGREDIENTS);

describe("tokenizeLine", () => {
	test("empty line", () => {
		expect(tokenizeLine("", index)).toEqual({
			tokens: [],
			isRecipeName: false,
		});
	});

	test("whitespace-only line", () => {
		expect(tokenizeLine("   ", index)).toEqual({
			tokens: [],
			isRecipeName: false,
		});
	});

	test("recipe name (no quantity)", () => {
		const result = tokenizeLine("Negroni", index);
		expect(result.isRecipeName).toBe(true);
		expect(result.tokens).toEqual([
			{
				type: "recipe-name",
				text: "Negroni",
				start: 0,
				end: 7,
				valid: true,
			},
		]);
	});

	test("full spec: quantity + unit + ingredient", () => {
		const result = tokenizeLine("3 cl Sipsmith Gin", index);
		expect(result.isRecipeName).toBe(false);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "3", start: 0, end: 1, valid: true },
			{ type: "unit", text: "cl", start: 2, end: 4, valid: true },
			{
				type: "ingredient",
				text: "Sipsmith Gin",
				start: 5,
				end: 17,
				valid: true,
				ingredientId: "gqWyGCI0EN",
			},
		]);
	});

	test("known ingredient gets ingredientId", () => {
		const result = tokenizeLine("2 cl Sipsmith Gin", index);
		const ingredientToken = result.tokens.find((t) => t.type === "ingredient");
		expect(ingredientToken?.ingredientId).toBe("gqWyGCI0EN");
	});

	test("unknown ingredient has no ingredientId", () => {
		const result = tokenizeLine("3 cl Unknown Spirit", index);
		const ingredientToken = result.tokens.find((t) => t.type === "ingredient");
		expect(ingredientToken?.ingredientId).toBeUndefined();
	});

	test("quantity without unit", () => {
		const result = tokenizeLine("2 cucumber slices", index);
		expect(result.isRecipeName).toBe(false);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "2", start: 0, end: 1, valid: true },
			{
				type: "ingredient",
				text: "cucumber slices",
				start: 2,
				end: 17,
				valid: true,
			},
		]);
	});

	test("fractional quantity", () => {
		const result = tokenizeLine("1/2 cl Lime", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "1/2",
			start: 0,
			end: 3,
		});
	});

	test("mixed number quantity", () => {
		const result = tokenizeLine("1 1/2 cl Lime", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "1 1/2",
			start: 0,
			end: 5,
		});
	});

	test("unicode fraction", () => {
		const result = tokenizeLine("½ cl Lime", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "½",
			start: 0,
		});
	});

	test("fl oz unit", () => {
		const result = tokenizeLine("1 fl oz Lime", index);
		expect(result.tokens[1]).toMatchObject({
			type: "unit",
			text: "fl oz",
		});
	});

	test("line with list prefix -", () => {
		const result = tokenizeLine("- 3 cl Lime", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "3",
		});
	});

	test("line with list prefix *", () => {
		const result = tokenizeLine("* 3 cl Lime", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "3",
		});
	});

	test("leading whitespace offsets are correct", () => {
		const result = tokenizeLine("  Negroni", index);
		expect(result.tokens[0]).toMatchObject({
			type: "recipe-name",
			text: "Negroni",
			start: 2,
			end: 9,
		});
	});

	test("trailing whitespace does not shift offsets", () => {
		const result = tokenizeLine("3 cl Lime ", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "3",
			start: 0,
			end: 1,
		});
		expect(result.tokens[1]).toMatchObject({
			type: "unit",
			text: "cl",
			start: 2,
			end: 4,
		});
		expect(result.tokens[2]).toMatchObject({
			type: "ingredient",
			text: "Lime",
			start: 5,
			end: 9,
		});
	});

	test("decimal quantity", () => {
		const result = tokenizeLine("2.5 cl Lime", index);
		expect(result.tokens[0]).toMatchObject({
			type: "quantity",
			text: "2.5",
			start: 0,
			end: 3,
		});
	});

	test("quantity only, no unit or ingredient", () => {
		const result = tokenizeLine("3", index);
		expect(result.isRecipeName).toBe(false);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "3", start: 0, end: 1, valid: true },
		]);
	});

	test("quantity + unit, no ingredient", () => {
		const result = tokenizeLine("3 cl", index);
		expect(result.isRecipeName).toBe(false);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "3", start: 0, end: 1, valid: true },
			{ type: "unit", text: "cl", start: 2, end: 4, valid: true },
		]);
	});

	test("no space between quantity and unit", () => {
		const result = tokenizeLine("3cl Lime", index);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "3", start: 0, end: 1, valid: true },
			{ type: "unit", text: "cl", start: 1, end: 3, valid: true },
			{
				type: "ingredient",
				text: "Lime",
				start: 4,
				end: 8,
				valid: true,
				ingredientId: "sP9_RdWlqg",
			},
		]);
	});

	test("multiple spaces between quantity and unit", () => {
		const result = tokenizeLine("3  cl Lime", index);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "3", start: 0, end: 1, valid: true },
			{ type: "unit", text: "cl", start: 3, end: 5, valid: true },
			{
				type: "ingredient",
				text: "Lime",
				start: 6,
				end: 10,
				valid: true,
				ingredientId: "sP9_RdWlqg",
			},
		]);
	});

	test("multiple spaces between unit and ingredient", () => {
		const result = tokenizeLine("3 cl  Lime", index);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "3", start: 0, end: 1, valid: true },
			{ type: "unit", text: "cl", start: 2, end: 4, valid: true },
			{
				type: "ingredient",
				text: "Lime",
				start: 6,
				end: 10,
				valid: true,
				ingredientId: "sP9_RdWlqg",
			},
		]);
	});

	test("multi-word unit offsets are correct", () => {
		const result = tokenizeLine("1 fl oz Lime", index);
		expect(result.tokens).toEqual([
			{ type: "quantity", text: "1", start: 0, end: 1, valid: true },
			{ type: "unit", text: "fl oz", start: 2, end: 7, valid: true },
			{
				type: "ingredient",
				text: "Lime",
				start: 8,
				end: 12,
				valid: true,
				ingredientId: "sP9_RdWlqg",
			},
		]);
	});

	test("case-insensitive ingredient match", () => {
		const result = tokenizeLine("2 cl lime", index);
		const ingredientToken = result.tokens.find((t) => t.type === "ingredient");
		expect(ingredientToken).toMatchObject({
			text: "lime",
			ingredientId: "sP9_RdWlqg",
		});
	});
});
