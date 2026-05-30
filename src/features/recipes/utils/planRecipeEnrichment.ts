import type { CocktailStyle } from "@/db/schema/cocktailStyles";
import type { Glassware } from "@/db/schema/glassware";
import type { Ice } from "@/db/schema/ice";
import type { PreparationMethod } from "@/db/schema/preparationMethods";
import { STYLE_TO_SERVE } from "@/features/recipes/constants";
import { isEmpty } from "@/utils";

type TargetFields = {
	style: CocktailStyle | null;
	glassware: Glassware | null;
	ice: Ice | null;
	preparationMethod: PreparationMethod | null;
};

/** Serve from the LLM, trusted when it resolved the style; null fields fall back to the style map. */
type LlmServe = {
	glassware?: Glassware | null;
	preparationMethod?: PreparationMethod | null;
	ice?: Ice | null;
};

export type RecipeEnrichmentPlan = {
	style?: CocktailStyle;
	glassware?: Glassware;
	ice?: Ice;
	preparationMethod?: PreparationMethod;
	aiEnrichedFields: Array<"style" | "glassware" | "ice" | "preparationMethod">;
};

/**
 * Compute what enrichment writes for one recipe: fills only empty fields, never
 * `other`. Serve comes from the deterministic style map; when the LLM resolved
 * the style (`llmServe`), its serve wins, with the map as a per-field fallback.
 */
export function planRecipeEnrichment(
	current: TargetFields,
	resolvedStyle: CocktailStyle | null,
	llmServe?: LlmServe,
): RecipeEnrichmentPlan | null {
	const fillStyle = resolvedStyle === "other" ? null : resolvedStyle;
	const styleForServe = current.style ?? fillStyle;
	const mapServe = styleForServe
		? STYLE_TO_SERVE.get(styleForServe)
		: undefined;

	const glassware = llmServe?.glassware ?? mapServe?.glassware;
	const preparationMethod =
		llmServe?.preparationMethod ?? mapServe?.preparationMethod;
	const serveIce = llmServe?.ice ?? mapServe?.ice;

	const plan: RecipeEnrichmentPlan = { aiEnrichedFields: [] };

	if (isEmpty(current.style) && fillStyle) {
		plan.style = fillStyle;
		plan.aiEnrichedFields.push("style");
	}
	if (isEmpty(current.glassware) && glassware) {
		plan.glassware = glassware;
		plan.aiEnrichedFields.push("glassware");
	}
	if (isEmpty(current.preparationMethod) && preparationMethod) {
		plan.preparationMethod = preparationMethod;
		plan.aiEnrichedFields.push("preparationMethod");
	}
	if (isEmpty(current.ice) && serveIce) {
		plan.ice = serveIce;
		plan.aiEnrichedFields.push("ice");
	}

	return plan.aiEnrichedFields.length > 0 ? plan : null;
}
