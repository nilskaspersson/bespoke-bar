import {
	type SystemCategory,
	systemCategories,
} from "@bespoke/schema/schema/categories";
import { invertMapToLookup } from "../utils/collection";
import { normalizeInput } from "../utils/text";
import { CATEGORY_ALIASES } from "./constants";

const aliasToCategory = invertMapToLookup(CATEGORY_ALIASES);

/**
 * Categories that are often "modifiers" within other products. Used to reduce
 * matching priority. F.e. "orange liqueur" shouldn't be categorised as "citrus"
 */
const MODIFIER_CATEGORIES = new Set<SystemCategory>([
	"citrus",
	"dairy",
	"fruit",
	"herb",
]);

/**
 * Calculate a matching score between input and alias.
 * @returns a score between 0 and 1, where 1 is a perfect match.
 */
function calculateMatchScore(input: string, alias: string): number {
	/**
	 * Perfect match!
	 */
	if (input === alias) {
		return 1;
	}

	/**
	 * Check if input contains the alias (e.g., "london dry gin" contains "gin")
	 */
	if (input.includes(alias)) {
		return alias.length / input.length;
	}

	return 0;
}

function findBestMatch(normalizedInput: string): SystemCategory | null {
	let bestScore = 0;
	let bestCategory: SystemCategory | null = null;
	let bestAliasLength = 0;
	let bestPrimaryCategory: SystemCategory | null = null;
	let bestPrimaryScore = 0;

	for (const [alias, category] of aliasToCategory.entries()) {
		const score = calculateMatchScore(normalizedInput, alias);

		if (score > 0) {
			/**
			 * Track the overall best match
			 */
			if (
				score > bestScore ||
				(score === bestScore && score === 1 && alias.length > bestAliasLength)
			) {
				bestScore = score;
				bestCategory = category;
				bestAliasLength = alias.length;
			}

			/**
			 * Track the best non-modifier category
			 */
			if (!MODIFIER_CATEGORIES.has(category) && score > bestPrimaryScore) {
				bestPrimaryCategory = category;
				bestPrimaryScore = score;
			}
		}
	}

	/**
	 * If we have a primary category match, prefer it over modifier categories
	 */
	if (
		bestPrimaryCategory &&
		bestCategory &&
		MODIFIER_CATEGORIES.has(bestCategory)
	) {
		return bestPrimaryCategory;
	}

	return bestCategory;
}

/**
 * Maps an ingredient name to a system category using fuzzy matching.
 * @note This is a very naive approach, with potential for many false positives.
 * Could be a good use-case for LLMs.
 * @returns The best matching category, or null if no match is found.
 */
export function matchNameWithCategory(name: string): SystemCategory | null {
	if (!name || typeof name !== "string") {
		return null;
	}

	const normalizedInput = normalizeInput(name);
	return findBestMatch(normalizedInput);
}

export function isSystemCategory(name: unknown): name is SystemCategory {
	return systemCategories.safeParse(name).success;
}
