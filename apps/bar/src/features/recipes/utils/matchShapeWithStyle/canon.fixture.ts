import type { SystemCategory } from "@/db/schema/categories";
import type { CocktailStyle } from "@/db/schema/cocktailStyles";
import type { PreparationMethod } from "@/db/schema/preparationMethods";
import type { ShapeRecipe } from "./";

/**
 * Canon of well-known cocktails for characterizing the classifier — ingredients
 * carry a stored `category`, so it tests the structural ceiling, not name
 * resolution. `family` is a reporting-only tag; `debatable` cases aren't asserted.
 */
type CanonLine = {
	category: SystemCategory;
	/** Volume in ml. Omit for muddled/dashed/presence-only components. */
	ml?: number;
	/** Number of dashes (bitters). */
	dash?: number;
	name?: string;
};

export type CanonCase = {
	name: string;
	lines: CanonLine[];
	prep?: PreparationMethod;
	expected: CocktailStyle | null;
	family?: string;
	debatable?: boolean;
};

export function toRecipe(testCase: CanonCase): ShapeRecipe {
	return {
		preparationMethod: testCase.prep,
		lines: testCase.lines.map((s) => ({
			quantity: s.ml ?? s.dash ?? null,
			unit: s.ml ? "ml" : s.dash ? "dash" : null,
			ingredient: { name: s.name ?? s.category, category: s.category },
		})),
	};
}

const spirit = (
	category: SystemCategory,
	ml: number,
	name?: string,
): CanonLine => ({ category, ml, name });

export const CANON: CanonCase[] = [
	// ── Sours ──────────────────────────────────────────────────────────────
	{
		name: "Daiquiri",
		expected: "sour",
		lines: [
			spirit("rum", 60, "White rum"),
			{ category: "citrus", ml: 30, name: "Lime juice" },
			{ category: "syrup", ml: 15, name: "Simple syrup" },
		],
	},
	{
		name: "Margarita",
		expected: "sour",
		lines: [
			spirit("tequila", 50),
			{ category: "citrus", ml: 25, name: "Lime juice" },
			{ category: "liqueur", ml: 20, name: "Triple sec" },
		],
	},
	{
		name: "Whiskey Sour",
		expected: "sour",
		lines: [
			spirit("bourbon", 60),
			{ category: "citrus", ml: 30, name: "Lemon juice" },
			{ category: "syrup", ml: 20 },
			{ category: "egg", name: "Egg white" },
		],
	},
	{
		name: "Sidecar",
		expected: "sour",
		lines: [
			spirit("cognac", 50),
			{ category: "liqueur", ml: 20, name: "Cointreau" },
			{ category: "citrus", ml: 20, name: "Lemon juice" },
		],
	},
	{
		name: "Cosmopolitan",
		expected: "sour",
		lines: [
			spirit("vodka", 45),
			{ category: "liqueur", ml: 15, name: "Cointreau" },
			{ category: "citrus", ml: 15, name: "Lime juice" },
			{ category: "juice", ml: 30, name: "Cranberry juice" },
		],
	},
	{
		name: "Gimlet",
		expected: "sour",
		lines: [
			spirit("gin", 60),
			{ category: "citrus", ml: 20, name: "Lime juice" },
			{ category: "syrup", ml: 15 },
		],
	},
	{
		name: "Aviation",
		expected: "sour",
		lines: [
			spirit("gin", 45),
			{ category: "liqueur", ml: 15, name: "Maraschino" },
			{ category: "citrus", ml: 15, name: "Lemon juice" },
			{ category: "liqueur", ml: 7, name: "Crème de violette" },
		],
	},
	{
		name: "Clover Club",
		expected: "sour",
		lines: [
			spirit("gin", 45),
			{ category: "citrus", ml: 15, name: "Lemon juice" },
			{ category: "syrup", ml: 15, name: "Raspberry syrup" },
			{ category: "egg", name: "Egg white" },
		],
	},
	{
		name: "Last Word",
		expected: "sour",
		family: "equal-parts",
		lines: [
			spirit("gin", 22),
			{ category: "herbal_liqueur", ml: 22, name: "Green Chartreuse" },
			{ category: "liqueur", ml: 22, name: "Maraschino" },
			{ category: "citrus", ml: 22, name: "Lime juice" },
		],
	},
	{
		name: "Paper Plane",
		expected: "sour",
		family: "equal-parts",
		lines: [
			spirit("bourbon", 22),
			{ category: "aperitif", ml: 22, name: "Aperol" },
			{ category: "amaro", ml: 22, name: "Amaro Nonino" },
			{ category: "citrus", ml: 22, name: "Lemon juice" },
		],
	},
	{
		name: "Trinidad Sour",
		expected: "sour",
		family: "oddball",
		lines: [
			{ category: "cocktail_bitters", ml: 45, name: "Angostura bitters" },
			{ category: "syrup", ml: 22, name: "Orgeat" },
			{ category: "citrus", ml: 22, name: "Lemon juice" },
			spirit("rye", 15),
		],
	},
	{
		name: "Corpse Reviver No. 2",
		expected: "sour",
		family: "equal-parts",
		lines: [
			spirit("gin", 22),
			{ category: "liqueur", ml: 22, name: "Cointreau" },
			{ category: "aperitif", ml: 22, name: "Lillet Blanc" },
			{ category: "citrus", ml: 22, name: "Lemon juice" },
			{ category: "absinthe", dash: 1, name: "Absinthe rinse" },
		],
	},

	// ── Fizzes / Collinses ───────────────────────────────────────────────────
	{
		name: "Tom Collins",
		expected: "fizz",
		lines: [
			spirit("gin", 45),
			{ category: "citrus", ml: 30, name: "Lemon juice" },
			{ category: "syrup", ml: 15 },
			{ category: "soda", ml: 60, name: "Soda water" },
		],
	},
	{
		name: "Gin Fizz",
		expected: "fizz",
		lines: [
			spirit("gin", 45),
			{ category: "citrus", ml: 30, name: "Lemon juice" },
			{ category: "syrup", ml: 15 },
			{ category: "soda", ml: 60, name: "Soda water" },
		],
	},
	{
		name: "Ramos Gin Fizz",
		expected: "fizz",
		lines: [
			spirit("gin", 45),
			{ category: "citrus", ml: 15, name: "Lemon juice" },
			{ category: "citrus", ml: 15, name: "Lime juice" },
			{ category: "syrup", ml: 30 },
			{ category: "dairy", ml: 30, name: "Cream" },
			{ category: "egg", name: "Egg white" },
			{ category: "soda", ml: 30, name: "Soda water" },
		],
	},
	{
		name: "French 75",
		expected: "sour",
		family: "sparkling",
		debatable: true,
		lines: [
			spirit("gin", 30),
			{ category: "citrus", ml: 15, name: "Lemon juice" },
			{ category: "syrup", ml: 10 },
			{ category: "champagne", ml: 60, name: "Champagne" },
		],
	},

	// ── Highballs ──────────────────────────────────────────────────────────
	{
		name: "Gin & Tonic",
		expected: "highball",
		lines: [
			spirit("gin", 50),
			{ category: "soda", ml: 150, name: "Tonic water" },
		],
	},
	{
		name: "Cuba Libre",
		expected: "highball",
		lines: [
			spirit("rum", 50, "White rum"),
			{ category: "soda", ml: 120, name: "Cola" },
			{ category: "citrus", ml: 10, name: "Lime juice" },
		],
	},
	{
		name: "Dark 'n' Stormy",
		expected: "highball",
		lines: [
			spirit("rum", 60, "Dark rum"),
			{ category: "soda", ml: 120, name: "Ginger beer" },
			{ category: "citrus", ml: 10, name: "Lime juice" },
		],
	},
	{
		name: "Moscow Mule",
		expected: "highball",
		lines: [
			spirit("vodka", 50),
			{ category: "citrus", ml: 15, name: "Lime juice" },
			{ category: "soda", ml: 120, name: "Ginger beer" },
		],
	},
	{
		name: "Paloma",
		expected: "highball",
		debatable: true,
		lines: [
			spirit("tequila", 50),
			{ category: "citrus", ml: 15, name: "Grapefruit juice" },
			{ category: "citrus", ml: 10, name: "Lime juice" },
			{ category: "soda", ml: 120, name: "Grapefruit soda" },
		],
	},
	{
		name: "Americano",
		expected: null,
		family: "no-base-spirit",
		debatable: true,
		lines: [
			{ category: "aperitif", ml: 30, name: "Campari" },
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "soda", ml: 60, name: "Soda water" },
		],
	},

	// ── Old Fashioneds ───────────────────────────────────────────────────────
	{
		name: "Old Fashioned",
		expected: "oldFashioned",
		lines: [
			spirit("bourbon", 60),
			{ category: "syrup", ml: 10, name: "Demerara syrup" },
			{ category: "cocktail_bitters", dash: 2, name: "Angostura bitters" },
		],
	},
	{
		name: "Sazerac",
		expected: "oldFashioned",
		lines: [
			spirit("rye", 60),
			{ category: "absinthe", dash: 1, name: "Absinthe rinse" },
			{ category: "syrup", ml: 5 },
			{ category: "cocktail_bitters", dash: 3, name: "Peychaud's bitters" },
		],
	},
	{
		name: "Oaxaca Old Fashioned",
		expected: "oldFashioned",
		lines: [
			spirit("tequila", 45, "Reposado tequila"),
			spirit("mezcal", 15),
			{ category: "syrup", ml: 5, name: "Agave nectar" },
			{ category: "cocktail_bitters", dash: 2 },
		],
	},

	// ── Martinis / Manhattans ──────────────────────────────────────────────
	{
		name: "Dry Martini",
		expected: "martini",
		lines: [
			spirit("gin", 60),
			{ category: "vermouth", ml: 10, name: "Dry vermouth" },
		],
	},
	{
		name: "Vodka Martini",
		expected: "martini",
		lines: [
			spirit("vodka", 60),
			{ category: "vermouth", ml: 10, name: "Dry vermouth" },
		],
	},
	{
		name: "Manhattan",
		expected: "manhattan",
		family: "manhattan",
		lines: [
			spirit("rye", 60),
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "cocktail_bitters", dash: 2, name: "Angostura bitters" },
		],
	},
	{
		name: "Rob Roy",
		expected: "manhattan",
		family: "manhattan",
		lines: [
			spirit("whiskey", 60, "Scotch"),
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "cocktail_bitters", dash: 2 },
		],
	},
	{
		name: "Martinez",
		expected: "martini",
		family: "boundary",
		debatable: true,
		lines: [
			spirit("gin", 45),
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "liqueur", ml: 5, name: "Maraschino" },
			{ category: "cocktail_bitters", dash: 2 },
		],
	},
	{
		name: "Vieux Carré",
		expected: "manhattan",
		family: "manhattan",
		lines: [
			spirit("rye", 30),
			spirit("cognac", 30),
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "herbal_liqueur", ml: 5, name: "Bénédictine" },
			{ category: "cocktail_bitters", dash: 2 },
		],
	},
	{
		name: "Negroni",
		expected: "negroni",
		family: "negroni",
		lines: [
			spirit("gin", 30),
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "aperitif", ml: 30, name: "Campari" },
		],
	},
	{
		name: "Boulevardier",
		expected: "negroni",
		family: "negroni",
		lines: [
			spirit("bourbon", 30),
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "aperitif", ml: 30, name: "Campari" },
		],
	},
	{
		name: "Hanky Panky",
		expected: "martini",
		lines: [
			spirit("gin", 45),
			{ category: "vermouth", ml: 45, name: "Sweet vermouth" },
			{ category: "amaro", ml: 7, name: "Fernet" },
		],
	},

	// ── Spritzes ───────────────────────────────────────────────────────────
	{
		name: "Aperol Spritz",
		expected: "spritz",
		lines: [
			{ category: "aperitif", ml: 60, name: "Aperol" },
			{ category: "champagne", ml: 90, name: "Prosecco" },
			{ category: "soda", ml: 30, name: "Soda water" },
		],
	},
	{
		name: "Negroni Sbagliato",
		expected: "spritz",
		debatable: true,
		lines: [
			{ category: "aperitif", ml: 30, name: "Campari" },
			{ category: "vermouth", ml: 30, name: "Sweet vermouth" },
			{ category: "champagne", ml: 60, name: "Prosecco" },
		],
	},

	// ── Smashes ──────────────────────────────────────────────────────────────
	{
		name: "Whiskey Smash",
		expected: "smash",
		lines: [
			spirit("bourbon", 60),
			{ category: "citrus", ml: 22, name: "Lemon juice" },
			{ category: "herb", name: "Mint" },
			{ category: "syrup", ml: 15 },
		],
	},
	{
		name: "Southside",
		expected: "smash",
		debatable: true,
		lines: [
			spirit("gin", 60),
			{ category: "citrus", ml: 22, name: "Lime juice" },
			{ category: "herb", name: "Mint" },
			{ category: "syrup", ml: 20 },
		],
	},
	{
		name: "Gin Basil Smash",
		expected: "smash",
		lines: [
			spirit("gin", 60),
			{ category: "citrus", ml: 22, name: "Lemon juice" },
			{ category: "herb", name: "Basil" },
			{ category: "syrup", ml: 15 },
		],
	},

	// ── Juleps ───────────────────────────────────────────────────────────────
	{
		name: "Mint Julep",
		expected: "julep",
		lines: [
			spirit("bourbon", 75),
			{ category: "herb", name: "Mint" },
			{ category: "syrup", ml: 15 },
		],
	},
	{
		name: "Prescription Julep",
		expected: "julep",
		lines: [
			spirit("cognac", 45),
			spirit("rye", 15),
			{ category: "herb", name: "Mint" },
			{ category: "syrup", ml: 15 },
		],
	},

	// ── Flips ────────────────────────────────────────────────────────────────
	{
		name: "Brandy Flip",
		expected: "flip",
		lines: [
			spirit("brandy", 60),
			{ category: "syrup", ml: 15 },
			{ category: "egg", name: "Whole egg" },
		],
	},
	{
		name: "Porto Flip",
		expected: "flip",
		lines: [
			{ category: "port", ml: 45, name: "Tawny port" },
			spirit("brandy", 15),
			{ category: "egg", name: "Egg yolk" },
			{ category: "syrup", ml: 10 },
		],
	},
	{
		name: "Coffee Cocktail",
		expected: "flip",
		lines: [
			spirit("cognac", 30),
			{ category: "port", ml: 30, name: "Tawny port" },
			{ category: "egg", name: "Whole egg" },
			{ category: "syrup", ml: 10 },
		],
	},

	// ── Tiki (mostly sour-shaped or abstaining) ──────────────────────────────
	{
		name: "Mai Tai",
		expected: "sour",
		family: "tiki",
		debatable: true,
		lines: [
			spirit("rum", 60, "Aged rum"),
			{ category: "citrus", ml: 22, name: "Lime juice" },
			{ category: "liqueur", ml: 15, name: "Orange curaçao" },
			{ category: "syrup", ml: 15, name: "Orgeat" },
		],
	},
	{
		name: "Zombie",
		expected: "sour",
		family: "tiki",
		debatable: true,
		lines: [
			spirit("rum", 45, "Dark rum"),
			spirit("rum", 45, "Aged rum"),
			{ category: "citrus", ml: 20, name: "Lime juice" },
			{ category: "liqueur", ml: 15, name: "Falernum" },
			{ category: "syrup", ml: 10, name: "Grenadine" },
		],
	},
	{
		name: "Piña Colada",
		expected: null,
		family: "tiki",
		prep: "blended",
		lines: [
			spirit("rum", 60, "White rum"),
			{ category: "dairy", ml: 60, name: "Coconut cream" },
			{ category: "juice", ml: 60, name: "Pineapple juice" },
		],
	},
	{
		name: "Painkiller",
		expected: null,
		family: "tiki",
		debatable: true,
		lines: [
			spirit("rum", 60, "Dark rum"),
			{ category: "juice", ml: 60, name: "Pineapple juice" },
			{ category: "citrus", ml: 30, name: "Orange juice" },
			{ category: "dairy", ml: 30, name: "Coconut cream" },
		],
	},

	// ── Named "martini" but not martini-family ───────────────────────────────
	{
		name: "Espresso Martini",
		expected: null,
		debatable: true,
		lines: [
			spirit("vodka", 50),
			{ category: "liqueur", ml: 30, name: "Coffee liqueur" },
			{ category: "other", ml: 30, name: "Espresso" },
		],
	},
];
