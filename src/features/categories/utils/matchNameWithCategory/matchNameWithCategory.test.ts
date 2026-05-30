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

	it("should match carbonated mixers as soda (not beer)", () => {
		expect(matchNameWithCategory("Soda water")).toBe("soda");
		expect(matchNameWithCategory("Tonic water")).toBe("soda");
		expect(matchNameWithCategory("Ginger beer")).toBe("soda");
		expect(matchNameWithCategory("Ginger ale")).toBe("soda");
		expect(matchNameWithCategory("Cola")).toBe("soda");
	});

	it("should match fresh herbs", () => {
		expect(matchNameWithCategory("Mint")).toBe("herb");
		expect(matchNameWithCategory("Fresh basil")).toBe("herb");
	});

	it("should match bittersweet aperitivi and amari", () => {
		expect(matchNameWithCategory("Campari")).toBe("aperitif");
		expect(matchNameWithCategory("Aperol")).toBe("aperitif");
		expect(matchNameWithCategory("Fernet-Branca")).toBe("amaro");
		expect(matchNameWithCategory("Cynar")).toBe("amaro");
	});

	it("should match herbal liqueurs", () => {
		expect(matchNameWithCategory("Green Chartreuse")).toBe("herbal_liqueur");
		expect(matchNameWithCategory("Bénédictine")).toBe("herbal_liqueur");
	});

	it("should prefer liqueur over the citrus modifier (orange curaçao)", () => {
		expect(matchNameWithCategory("Maraschino")).toBe("liqueur");
		expect(matchNameWithCategory("Orange Curaçao")).toBe("liqueur");
		expect(matchNameWithCategory("Crème de Violette")).toBe("liqueur");
	});

	it("should match non-citrus juices without hijacking citrus juices", () => {
		expect(matchNameWithCategory("Pineapple juice")).toBe("juice");
		expect(matchNameWithCategory("Cranberry juice")).toBe("juice");
		expect(matchNameWithCategory("Fresh lime juice")).toBe("citrus");
		expect(matchNameWithCategory("Orange juice")).toBe("citrus");
	});

	it("should match agave and the long tail of flavored syrups", () => {
		expect(matchNameWithCategory("Agave")).toBe("syrup");
		expect(matchNameWithCategory("Agave syrup")).toBe("syrup");
		expect(matchNameWithCategory("Cinnamon syrup")).toBe("syrup");
		expect(matchNameWithCategory("Vanilla syrup")).toBe("syrup");
		expect(matchNameWithCategory("Honey syrup")).toBe("honey");
	});
});
