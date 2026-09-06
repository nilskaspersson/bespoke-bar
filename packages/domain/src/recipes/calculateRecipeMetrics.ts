import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import type { BaseRecipe } from "@bespoke/schema/schema/recipes";
import { DB_UNIT_TO_LIB_UNIT } from "../units/constants";
import { convert } from "../units/convert";

export type RecipeMetrics = {
	abv: number;
	undilutedAbv: number;
	originalVolume: number;
	dilutionVolume: number;
	finalVolume: number;
	dilutionOfOriginalVolume: number;
	dilutionOfFinalVolume: number;
};

/**
 * Calculate total liquid and alcohol volumes from a list of lines
 */
export function calculateLineVolumes<
	T extends DraftIngredientLineWithDraftIngredient,
>(lines: T[] | undefined, servings = 1) {
	if (!lines || lines.length === 0) {
		return { totalLiquidVolume: 0, alcoholVolume: 0 };
	}

	let totalLiquidVolume = 0;
	let alcoholVolume = 0;

	for (const line of lines) {
		if (!line.quantity || !line.unit) {
			continue;
		}

		const libUnit = DB_UNIT_TO_LIB_UNIT.get(line.unit);

		if (!libUnit) {
			continue;
		}

		const measurementType = convert().describe(libUnit).measure;

		if (measurementType !== "volume") {
			continue;
		}

		const volumeInMl = convert(line.quantity).from(libUnit).to("ml");
		totalLiquidVolume += volumeInMl;

		if (typeof line.ingredient.abv === "number" && line.ingredient.abv > 0) {
			alcoholVolume += volumeInMl * line.ingredient.abv;
		}
	}

	return {
		totalLiquidVolume: totalLiquidVolume * servings,
		alcoholVolume: alcoholVolume * servings,
	};
}

/**
 * Get dilution target (water added, as a percentage of the undiluted volume)
 * from recipe.
 */
function getDilutionTarget(recipe: BaseRecipe): number {
	const target = recipe.dilutionTarget;
	return typeof target === "number" && target >= 0 ? target : 0;
}

/**
 * Calculate dilution volume from the target. The target is the volume _gained_,
 * so 100 ml at 0.25 finishes at 125 ml, not 133 ml.
 */
function calculateDilutionFromTarget(
	originalVolume: number,
	dilutionTarget: number,
): { dilutionVolume: number; finalVolume: number } {
	const dilutionVolume = originalVolume * dilutionTarget;

	return {
		dilutionVolume,
		finalVolume: originalVolume + dilutionVolume,
	};
}

export function calculateRecipeMetrics<T extends BaseRecipe>(
	recipe: T,
	{ servings = 1 }: { servings?: number } = {},
): RecipeMetrics {
	const volumes = calculateLineVolumes(recipe.lines, servings);

	if (volumes.totalLiquidVolume === 0) {
		return {
			abv: 0,
			undilutedAbv: 0,
			originalVolume: 0,
			dilutionVolume: 0,
			finalVolume: 0,
			dilutionOfOriginalVolume: 0,
			dilutionOfFinalVolume: 0,
		};
	}

	const dilutionTarget = getDilutionTarget(recipe);
	const { dilutionVolume, finalVolume } = calculateDilutionFromTarget(
		volumes.totalLiquidVolume,
		dilutionTarget,
	);

	const dilutionOfOriginalVolume = dilutionVolume / volumes.totalLiquidVolume;
	const dilutionOfFinalVolume = dilutionVolume / finalVolume;

	return {
		abv: volumes.alcoholVolume / finalVolume,
		undilutedAbv: volumes.alcoholVolume / volumes.totalLiquidVolume,
		originalVolume: volumes.totalLiquidVolume,
		dilutionVolume,
		finalVolume,
		dilutionOfOriginalVolume,
		dilutionOfFinalVolume,
	};
}
