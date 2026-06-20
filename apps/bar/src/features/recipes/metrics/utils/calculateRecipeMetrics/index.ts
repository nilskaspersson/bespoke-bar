import type { DraftIngredientLineWithDraftIngredient } from "@/db/schema/ingredientLines";
import type { BaseRecipe } from "@/db/schema/recipes";
import { DB_UNIT_TO_LIB_UNIT } from "@/features/units/constants";
import { convert } from "@/features/units/utils/convert";

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
 * Get dilution target (percentage of final volume that should be water)
 * from recipe, defaulting to 0 if not defined
 */
function getDilutionTarget(recipe: BaseRecipe): number {
	const target = recipe.dilutionTarget;
	return typeof target === "number" && target >= 0 && target < 1 ? target : 0;
}

/**
 * Calculate dilution volume based on target percentage of final volume
 */
function calculateDilutionFromTarget(
	originalVolume: number,
	dilutionTarget: number,
): { dilutionVolume: number; finalVolume: number } {
	if (dilutionTarget === 0 || originalVolume === 0) {
		return {
			dilutionVolume: 0,
			finalVolume: originalVolume,
		};
	}

	const dilutionVolume =
		(dilutionTarget * originalVolume) / (1 - dilutionTarget);
	const finalVolume = originalVolume + dilutionVolume;

	return {
		dilutionVolume,
		finalVolume,
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
