import type { PreparationMethod } from "@bespoke/schema/schema/preparationMethods";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";

/**
 * Water each method takes on, as a percentage of the undiluted volume.
 */
export const METHOD_TO_DEFAULT_DILUTION = new Map<PreparationMethod, number>([
	["stirred", 0.2],
	["shaken", 0.25],
	["built", 0.15],
	["blended", 0.3],
	["layered", 0],
]);

/**
 * What to assume when a Recipe says nothing. A Draft Recipe parsed from text
 * carries neither a dilution target nor a Preparation Method, and reporting it
 * as served neat would be the wrong guess for nearly every cocktail.
 */
export const ASSUMED_PREPARATION_METHOD: PreparationMethod = "shaken";

/**
 * The Preparation Method a Recipe is served by on its own evidence, falling
 * back to the assumption above. Its dilution is a display-time estimate, never
 * stored — {@link METHOD_TO_DEFAULT_DILUTION} is the standard for each method.
 */
export function getAssumedPreparationMethod(
	recipe: Pick<BaseRecipe, "preparationMethod">,
): PreparationMethod {
	return recipe.preparationMethod ?? ASSUMED_PREPARATION_METHOD;
}
