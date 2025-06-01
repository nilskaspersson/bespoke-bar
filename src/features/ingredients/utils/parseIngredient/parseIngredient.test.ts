import { describe, expect, test } from "vitest";
import { parseIngredient } from ".";

describe("parseIngredient", () => {
	describe("basic capitalization + whitespace handling", () => {
		test.each([
			["gin", ["Gin", ""]],
			["lemon juice", ["Lemon juice", ""]],
			["  gin  ", ["Gin", ""]],
			["gin   and   tonic", ["Gin and tonic", ""]],
		])('Parses "%s" as %j', (input, expected) => {
			expect(parseIngredient(input)).toEqual(expected);
		});
	});

	describe("preserve user casing after first letter", () => {
		test.each([
			["grey GOOSE vodka", ["Grey GOOSE vodka", ""]],
			["crème de cacao", ["Crème de cacao", ""]],
		])('Parses "%s" as %j', (input, expected) => {
			expect(parseIngredient(input)).toEqual(expected);
		});
	});

	describe("edge cases (special characters, empty strings, etc.)", () => {
		test.each([
			["gin\x00tonic", ["Gintonic", ""]],
			["lemon\x08juice", ["Lemonjuice", ""]],
			["  gin\x00   &   tonic  ", ["Gin & tonic", ""]],
			["", [null, ""]],
			["   ", [null, ""]],
			["jalapeño", ["Jalapeño", ""]],
		])('Parses "%s" as %j', (input, expected) => {
			expect(parseIngredient(input)).toEqual(expected);
		});
	});
});
