import { describe, expect, it } from "vitest";
import { matchNameWithCategory } from "./";

describe("matchNameWithCategory", () => {
	it("should match exact (case-insensitive) category names", () => {
		expect(matchNameWithCategory("Gin")).toBe("gin");
		expect(matchNameWithCategory("vodka")).toBe("vodka");
		expect(matchNameWithCategory("LIME")).toBe("citrus");
	});

	it("some branded spirits include the category in the name", () => {
		expect(matchNameWithCategory("Hendrick's Gin")).toBe("gin");
		expect(matchNameWithCategory("London Dry Gin")).toBe("gin");
		expect(matchNameWithCategory("Grey Goose Vodka")).toBe("vodka");
		expect(matchNameWithCategory("Maker's Mark Bourbon")).toBe("bourbon");
	});

	it("should match common spelling variations and aliases", () => {
		expect(matchNameWithCategory("whisky")).toBe("whiskey");
		expect(matchNameWithCategory("rhum")).toBe("rum");
		expect(matchNameWithCategory("jenever")).toBe("genever");
	});

	it("should match compound ingredient names", () => {
		expect(matchNameWithCategory("bourbon whiskey")).toBe("bourbon");
		expect(matchNameWithCategory("dry vermouth")).toBe("vermouth");
		expect(matchNameWithCategory("simple syrup")).toBe("syrup");
	});

	it("should prefer primary categories over modifiers", () => {
		expect(matchNameWithCategory("orange bitters")).toBe("cocktail_bitters");
		expect(matchNameWithCategory("cream liqueur")).toBe("liqueur");
		expect(matchNameWithCategory("lime cordial")).toBe("liqueur");
		expect(matchNameWithCategory("cherry brandy")).toBe("brandy");
	});

	it("should return modifier categories when no primary alternative", () => {
		expect(matchNameWithCategory("fresh lime juice")).toBe("citrus");
		expect(matchNameWithCategory("heavy cream")).toBe("dairy");
		expect(matchNameWithCategory("lemon")).toBe("citrus");
	});

	it("should handle edge cases gracefully", () => {
		expect(matchNameWithCategory("")).toBe(null);
		expect(matchNameWithCategory("unknown ingredient")).toBe(null);
		expect(matchNameWithCategory("random text")).toBe(null);
	});

	it("should handle accented characters", () => {
		expect(matchNameWithCategory("Cachaça")).toBe("cachaca");
		expect(matchNameWithCategory("Saké")).toBe("sake");
	});

	it("should match some specific liqueur brands", () => {
		expect(matchNameWithCategory("Cointreau")).toBe("liqueur");
		expect(matchNameWithCategory("Triple Sec")).toBe("liqueur");
		expect(matchNameWithCategory("Amaretto")).toBe("liqueur");
	});

	it("should match bitters variations", () => {
		expect(matchNameWithCategory("Angostura")).toBe("cocktail_bitters");
		expect(matchNameWithCategory("Peychaud's")).toBe("cocktail_bitters");
	});
});
