import { describe, expect, test } from "vitest";
import { formatIngredient } from ".";

describe("parseIngredient", () => {
	describe("whitespace handling", () => {
		test.each([
			["gin", "gin"],
			["lemon juice", "lemon juice"],
			["  gin  ", "gin"],
			["gin   and   tonic", "gin and tonic"],
		])('Parses "%s" as %j', (input, expected) => {
			expect(formatIngredient(input)).toEqual(expected);
		});
	});

	describe("preserve user casing after first letter", () => {
		test.each([
			["grey GOOSE vodka", "grey GOOSE vodka"],
			["crème de cacao", "crème de cacao"],
		])('Parses "%s" as %j', (input, expected) => {
			expect(formatIngredient(input)).toEqual(expected);
		});
	});

	describe("edge cases (special characters, empty strings, etc.)", () => {
		test.each([
			["gin\x00tonic", "gintonic"],
			["lemon\x08juice", "lemonjuice"],
			["  gin\x00   &   tonic  ", "gin & tonic"],
			["", null],
			["   ", null],
			["jalapeño", "jalapeño"],
		])('Parses "%s" as %j', (input, expected) => {
			expect(formatIngredient(input)).toEqual(expected);
		});
	});
});
