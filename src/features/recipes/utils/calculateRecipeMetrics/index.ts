import type { PreparationMethod } from "@/db/schema/preparationMethods";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { convert } from "@/features/units/utils/convert";

type RecipeAbvResult = {
	abv: number;
	originalVolume: number;
	dilutionVolume: number;
	finalVolume: number;
	dilutionOfOriginalVolume: number;
	dilutionOfFinalVolume: number;
};

/**
 * Get default dilution percentage averages based on preparation method
 */
function getDefaultDilution(
	preparationMethod: PreparationMethod | null,
): number {
	switch (preparationMethod) {
		case "stirred":
			return 0.4;
		case "shaken":
			return 0.55;
		case "built":
			return 0.15;
		case "blended":
			return 0.6;
		case "carbonated":
			return 0.2;

		default:
			return 0.35;
	}
}

/**
 * Calculate total liquid and alcohol volumes from recipe specs
 */
export function calculateRecipeVolumes(recipe: RecipeWithSpecs) {
	if (!recipe.specs || recipe.specs.length === 0) {
		return { totalLiquidVolume: 0, alcoholVolume: 0 };
	}

	let totalLiquidVolume = 0;
	let alcoholVolume = 0;

	for (const spec of recipe.specs) {
		if (!spec.quantity || !spec.unit) {
			continue;
		}

		const measurementType = convert().describe(spec.unit).measure;

		if (measurementType !== "volume") {
			continue;
		}

		const volumeInMl = convert(spec.quantity).from(spec.unit).to("ml");
		totalLiquidVolume += volumeInMl;

		if (typeof spec.ingredient.abv === "number" && spec.ingredient.abv > 0) {
			alcoholVolume += volumeInMl * spec.ingredient.abv;
		}
	}

	return { totalLiquidVolume, alcoholVolume };
}

export function calculateRecipeMetrics(
	recipe: RecipeWithSpecs,
	dilutionOverride?: number,
): RecipeAbvResult {
	const volumes = calculateRecipeVolumes(recipe);

	if (volumes.totalLiquidVolume === 0) {
		return {
			abv: 0,
			originalVolume: 0,
			dilutionVolume: 0,
			finalVolume: 0,
			dilutionOfOriginalVolume: 0,
			dilutionOfFinalVolume: 0,
		};
	}

	const dilutionOfOriginalVolume =
		dilutionOverride ?? getDefaultDilution(recipe.preparationMethod);

	const dilutionVolume = volumes.totalLiquidVolume * dilutionOfOriginalVolume;
	const finalVolume = volumes.totalLiquidVolume + dilutionVolume;
	const dilutionOfFinalVolume = dilutionVolume / finalVolume;

	return {
		abv: volumes.alcoholVolume / finalVolume,
		originalVolume: volumes.totalLiquidVolume,
		dilutionVolume,
		finalVolume,
		dilutionOfOriginalVolume,
		dilutionOfFinalVolume,
	};
}
