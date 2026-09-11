import { describe, expect, it } from "vitest";
import { getClassicCocktail } from "./classicCocktails";
import data from "./classicCocktails.json";
import { classicCocktailRegistrySchema } from "./classicCocktails.zod";

describe("classicCocktails registry", () => {
	it("matches the schema enums", () => {
		const result = classicCocktailRegistrySchema.safeParse(data);
		expect(result.error?.issues ?? []).toEqual([]);
	});

	it("has unique names", () => {
		const names = data.cocktails.map((cocktail) => cocktail.name);
		expect(new Set(names).size).toBe(names.length);
	});
});

describe("getClassicCocktail", () => {
	it("builds a keyed BaseRecipe with derived ingredient data", () => {
		const daiquiri = getClassicCocktail("Daiquiri");

		expect(daiquiri).toMatchObject({
			name: "Daiquiri",
			style: "sour",
			preparationMethod: "shaken",
			ice: "none",
		});
		expect(daiquiri.lines).toHaveLength(3);
		expect(daiquiri.lines?.[0]).toMatchObject({
			_key: "Daiquiri:0",
			quantity: 60,
			unit: "ml",
			ingredient: {
				name: "Cuban White Rum",
				category: "rum",
				abv: 0.4,
				measurementType: "volume",
			},
		});
	});

	it("keeps unmeasured lines unitless", () => {
		const mojito = getClassicCocktail("Mojito");
		const soda = mojito.lines?.find(
			(line) => line.ingredient.name === "Soda Water",
		);

		expect(soda).toMatchObject({ quantity: null, unit: null });
		expect(soda?.ingredient.measurementType).toBeNull();
	});

	it("throws on an unknown name", () => {
		expect(() => getClassicCocktail("Nope")).toThrow(
			/Unknown classic cocktail/,
		);
	});
});
