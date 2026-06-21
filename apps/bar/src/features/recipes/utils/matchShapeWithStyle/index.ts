import type { SystemCategory } from "@bespoke/schema/schema/categories";
import type { CocktailStyle } from "@bespoke/schema/schema/cocktailStyles";
import type { IngredientLine } from "@bespoke/schema/schema/ingredientLines";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";
import { matchNameWithCategory } from "@/features/categories/utils/matchNameWithCategory";
import { calculateLineVolumes } from "@/features/recipes/metrics/utils/calculateRecipeMetrics";

/** Ingredient categories collapsed to the roles that discriminate families (exhaustive via `satisfies`). */
type ShapeRole =
	| "spirit"
	| "fortified"
	| "aperitivo"
	| "liqueur"
	| "bitters"
	| "citrus"
	| "juice"
	| "sweetener"
	| "egg"
	| "dairy"
	| "soda"
	| "sparkling"
	| "wine"
	| "herb"
	| "fruit"
	| "other";

const CATEGORY_TO_ROLE = {
	absinthe: "spirit",
	aquavit: "spirit",
	armagnac: "spirit",
	baijiu: "spirit",
	bourbon: "spirit",
	brandy: "spirit",
	cachaca: "spirit",
	calvados: "spirit",
	cognac: "spirit",
	gin: "spirit",
	genever: "spirit",
	grappa: "spirit",
	mezcal: "spirit",
	pisco: "spirit",
	rum: "spirit",
	rye: "spirit",
	shochu: "spirit",
	tequila: "spirit",
	vodka: "spirit",
	whiskey: "spirit",
	vermouth: "fortified",
	sherry: "fortified",
	port: "fortified",
	sake: "fortified",
	aperitif: "aperitivo",
	amaro: "aperitivo",
	liqueur: "liqueur",
	herbal_liqueur: "liqueur",
	bitters: "bitters",
	cocktail_bitters: "bitters",
	wine: "wine",
	champagne: "sparkling",
	beer: "other",
	citrus: "citrus",
	juice: "juice",
	fruit: "fruit",
	herb: "herb",
	egg: "egg",
	dairy: "dairy",
	syrup: "sweetener",
	honey: "sweetener",
	soda: "soda",
	other: "other",
} satisfies Record<SystemCategory, ShapeRole>;

type ShapeLine = Partial<
	Pick<IngredientLine, "quantity" | "unit" | "optional">
> & {
	ingredient?: Partial<Pick<Ingredient, "name" | "category" | "abv">> | null;
};

export type ShapeRecipe = {
	preparationMethod?: PreparationMethod | null;
	lines?: ShapeLine[] | null;
};

export type RecipeShape = {
	roleCounts: Partial<Record<ShapeRole, number>>;
	/** ml per role; lines with no/non-convertible unit contribute 0. */
	volumeByRole: Partial<Record<ShapeRole, number>>;
	totalVolume: number;
	/** Any line carried a usable quantity+unit — gates the ratio rules. */
	hasVolumeData: boolean;
	equalParts: boolean;
	/** Any whiskey/brandy base — the Manhattan/Martini split axis. */
	hasBrownSpirit: boolean;
	coreLineCount: number;
	spiritCount: number;
	preparationMethod: PreparationMethod | null;
};

export type StyleMatch = {
	style: CocktailStyle | null;
	confidence: number;
	rule: string | null;
	shape: RecipeShape;
};

/** Above this, the orchestrator trusts the heuristic and skips the LLM. */
export const STYLE_CONFIDENCE_THRESHOLD = 0.7;

/** Citrus below this share of volume is an accent, not a sour component. */
const CITRUS_MIN_SHARE = 0.1;
/** Soda above this share is a long mixer (highball). */
const MIXER_DOMINANT_SHARE = 0.4;
const EQUAL_PARTS_MAX_RATIO = 1.5;
/** Aperitivo below this share is a modifier (a dash of Fernet), not a Negroni's Campari. */
const APERITIVO_MIN_SHARE = 0.15;

const BROWN_SPIRITS = new Set<SystemCategory>([
	"bourbon",
	"rye",
	"whiskey",
	"cognac",
	"brandy",
	"armagnac",
	"calvados",
]);

function resolveCategory(
	ingredient: ShapeLine["ingredient"],
): SystemCategory | null {
	if (!ingredient) {
		return null;
	}
	if (ingredient.category) {
		return ingredient.category;
	}
	if (!ingredient.name) {
		return null;
	}
	return matchNameWithCategory(ingredient.name);
}

/** ml of a single line, or 0 when it has no quantity/unit or a non-volume unit. */
function lineVolume(line: ShapeLine): number {
	return calculateLineVolumes([
		{
			quantity: line.quantity,
			unit: line.unit,
			ingredient: { abv: line.ingredient?.abv ?? null },
		},
	]).totalLiquidVolume;
}

/**
 * Reduce a recipe to its structural shape. Presence is counted independently of
 * volume, so a whole egg or a dash of bitters still registers.
 */
export function getRecipeShape(recipe: ShapeRecipe): RecipeShape {
	const roleCounts: Partial<Record<ShapeRole, number>> = {};
	const volumeByRole: Partial<Record<ShapeRole, number>> = {};
	const componentVolumes: number[] = [];
	let totalVolume = 0;
	let coreLineCount = 0;
	let spiritCount = 0;
	let hasBrownSpirit = false;

	for (const line of recipe.lines ?? []) {
		if (line?.optional) {
			continue;
		}
		const category = resolveCategory(line?.ingredient);
		if (!category) {
			continue;
		}
		const role = CATEGORY_TO_ROLE[category];
		roleCounts[role] = (roleCounts[role] ?? 0) + 1;
		coreLineCount += 1;
		if (role === "spirit") {
			spiritCount += 1;
			if (BROWN_SPIRITS.has(category)) {
				hasBrownSpirit = true;
			}
		}

		const volume = lineVolume(line);
		if (volume > 0) {
			volumeByRole[role] = (volumeByRole[role] ?? 0) + volume;
			totalVolume += volume;
			componentVolumes.push(volume);
		}
	}

	return {
		roleCounts,
		volumeByRole,
		totalVolume,
		hasVolumeData: totalVolume > 0,
		equalParts: isEqualParts(componentVolumes),
		hasBrownSpirit,
		coreLineCount,
		spiritCount,
		preparationMethod: recipe.preparationMethod ?? null,
	};
}

function isEqualParts(volumes: number[]): boolean {
	if (volumes.length < 3) {
		return false;
	}
	const min = Math.min(...volumes);
	const max = Math.max(...volumes);
	return min > 0 && max / min <= EQUAL_PARTS_MAX_RATIO;
}

type ShapeFlags = ReturnType<typeof flagsOf>;

function flagsOf(shape: RecipeShape) {
	const count = (role: ShapeRole) => shape.roleCounts[role] ?? 0;
	const share = (role: ShapeRole) =>
		shape.totalVolume > 0
			? (shape.volumeByRole[role] ?? 0) / shape.totalVolume
			: 0;

	const citrusPresent = count("citrus") > 0;
	const hasSweetener = count("sweetener") > 0;
	const hasLiqueur = count("liqueur") > 0;
	const hasAperitivo = count("aperitivo") > 0;
	const sodaPresent = count("soda") > 0;
	/** Soda present but unmeasured — a "top up with soda" — reads as the long mixer. */
	const sodaTopUp = sodaPresent && (shape.volumeByRole.soda ?? 0) === 0;

	return {
		spiritCount: shape.spiritCount,
		coreLineCount: shape.coreLineCount,
		hasVolumeData: shape.hasVolumeData,
		hasSpirit: shape.spiritCount > 0,
		/** Real citrus, not a twist: trusted on presence without volumes, else share-gated. */
		hasCitrus: shape.hasVolumeData
			? citrusPresent && share("citrus") >= CITRUS_MIN_SHARE
			: citrusPresent,
		hasSweetener,
		hasLiqueur,
		hasAperitivo,
		/** What balances a sour — liqueurs and bittersweet aperitivi count, not just syrup. */
		hasSweetAgent: hasSweetener || hasLiqueur || hasAperitivo,
		/** A Negroni's Campari, not a dash of amaro — share-gated when volumes exist. */
		aperitivoIsComponent: shape.hasVolumeData
			? hasAperitivo && share("aperitivo") >= APERITIVO_MIN_SHARE
			: hasAperitivo,
		hasBrownSpirit: shape.hasBrownSpirit,
		hasBitters: count("bitters") > 0,
		hasEgg: count("egg") > 0,
		hasFortified: count("fortified") > 0,
		hasSoda: sodaPresent,
		hasSparkling: count("sparkling") > 0,
		hasHerb: count("herb") > 0,
		/** Soda dominates the pour (highball): a measured majority share, or an
		 * unmeasured top-up over a measured base; else fall back to line count. */
		sodaDominant: shape.hasVolumeData
			? sodaTopUp || share("soda") >= MIXER_DOMINANT_SHARE
			: shape.coreLineCount <= 3,
	};
}

/**
 * Ordered signatures, first match wins (specific families before broad ones).
 * Anything unmatched abstains (null) for the LLM. Major family only, never `other`.
 */
const RULES: Array<{
	style: CocktailStyle;
	confidence: number;
	matches: (f: ShapeFlags) => boolean;
}> = [
	// Spritz, Sbagliato
	{
		style: "spritz",
		confidence: 0.85,
		matches: (f) => f.hasAperitivo && f.hasSparkling && f.spiritCount === 0,
	},
	// Flip — whole egg, no citrus (an egg-white sour carries citrus)
	{
		style: "flip",
		confidence: 0.7,
		matches: (f) =>
			f.hasEgg && !f.hasCitrus && !f.hasSoda && !f.hasSparkling && f.hasSpirit,
	},
	// Smash — whiskey smash, southside
	{
		style: "smash",
		confidence: 0.7,
		matches: (f) => f.hasSpirit && f.hasHerb && f.hasCitrus && !f.hasSoda,
	},
	// Julep — mint julep
	{
		style: "julep",
		confidence: 0.7,
		matches: (f) => f.hasSpirit && f.hasHerb && !f.hasCitrus && !f.hasSoda,
	},
	// Fizz / Collins
	{
		style: "fizz",
		confidence: 0.8,
		matches: (f) => f.hasSpirit && f.hasCitrus && f.hasSweetAgent && f.hasSoda,
	},
	// Sour — daiquiri, margarita, Last Word, Paper Plane, Trinidad Sour
	{
		style: "sour",
		confidence: 0.8,
		matches: (f) => f.hasSpirit && f.hasCitrus && f.hasSweetAgent && !f.hasSoda,
	},
	// Old Fashioned, Sazerac
	{
		style: "oldFashioned",
		confidence: 0.85,
		matches: (f) =>
			f.hasSpirit &&
			f.hasBitters &&
			!f.hasCitrus &&
			!f.hasFortified &&
			!f.hasAperitivo &&
			!f.hasSoda &&
			!f.hasSparkling,
	},
	// Negroni family — checked before manhattan/martini so the Campari decides it
	{
		style: "negroni",
		confidence: 0.8,
		matches: (f) =>
			f.hasSpirit &&
			f.hasFortified &&
			f.aperitivoIsComponent &&
			!f.hasCitrus &&
			!f.hasSoda &&
			!f.hasSparkling,
	},
	// Manhattan family — brown base + vermouth
	{
		style: "manhattan",
		confidence: 0.78,
		matches: (f) =>
			f.hasSpirit &&
			f.hasBrownSpirit &&
			f.hasFortified &&
			!f.hasCitrus &&
			!f.hasSoda &&
			!f.hasSparkling &&
			!f.hasEgg,
	},
	// Martini family — clear base + vermouth/aperitivo
	{
		style: "martini",
		confidence: 0.75,
		matches: (f) =>
			f.hasSpirit &&
			(f.hasFortified || f.hasAperitivo) &&
			!f.hasCitrus &&
			!f.hasSoda &&
			!f.hasSparkling &&
			!f.hasEgg,
	},
	// Highball — G&T, mule, cuba libre
	{
		style: "highball",
		confidence: 0.6,
		matches: (f) =>
			f.spiritCount >= 1 &&
			f.hasSoda &&
			f.sodaDominant &&
			!f.hasSweetAgent &&
			!f.hasBitters &&
			!f.hasEgg &&
			!f.hasFortified &&
			!f.hasAperitivo &&
			!f.hasHerb,
	},
];

/**
 * Zero-cost structural classifier: a major-family style + confidence, or abstain
 * (null) for the LLM. Occasion families (aperitif, tiki, punch…) need a name and
 * are left to the LLM; name-based resolution also weakens for brand-new
 * ingredients without a stored category.
 */
export function matchShapeWithStyle(recipe: ShapeRecipe): StyleMatch {
	const shape = getRecipeShape(recipe);
	const flags = flagsOf(shape);

	for (const rule of RULES) {
		if (rule.matches(flags)) {
			return {
				style: rule.style,
				confidence: rule.confidence,
				rule: rule.style,
				shape,
			};
		}
	}

	return { style: null, confidence: 0, rule: null, shape };
}

/** @public */
export function describeShape(shape: RecipeShape): string {
	const roles = Object.entries(shape.roleCounts)
		.map(([role, n]) => (n > 1 ? `${role}×${n}` : role))
		.join(", ");
	const prep = shape.preparationMethod ? `, ${shape.preparationMethod}` : "";
	const equal = shape.equalParts ? ", equal-parts" : "";
	return `${roles || "no recognized ingredients"}${prep}${equal}`;
}
