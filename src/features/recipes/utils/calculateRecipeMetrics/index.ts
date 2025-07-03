import type { PreparationMethod } from "@/db/schema/preparationMethods";
import type { BaseRecipe } from "@/db/schema/recipes";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
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
 * Get default dilution percentage averages based on preparation method
 */
function getDefaultDilution(
	preparationMethod: PreparationMethod | null | undefined,
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
 * Calculate total liquid and alcohol volumes from a list of specs
 */
export function calculateSpecsVolumes<T extends DraftSpecWithDraftIngredient>(
	specs: T[] | undefined,
	servings = 1,
) {
	if (!specs || specs.length === 0) {
		return { totalLiquidVolume: 0, alcoholVolume: 0 };
	}

	let totalLiquidVolume = 0;
	let alcoholVolume = 0;

	for (const spec of specs) {
		if (!spec.quantity || !spec.unit) {
			continue;
		}

		const libUnit = DB_UNIT_TO_LIB_UNIT.get(spec.unit);

		if (!libUnit) {
			continue;
		}

		const measurementType = convert().describe(libUnit).measure;

		if (measurementType !== "volume") {
			continue;
		}

		const volumeInMl = convert(spec.quantity).from(libUnit).to("ml");
		totalLiquidVolume += volumeInMl;

		if (typeof spec.ingredient.abv === "number" && spec.ingredient.abv > 0) {
			alcoholVolume += volumeInMl * spec.ingredient.abv;
		}
	}

	return {
		totalLiquidVolume: totalLiquidVolume * servings,
		alcoholVolume: alcoholVolume * servings,
	};
}

export function calculateRecipeMetrics<T extends BaseRecipe>(
	recipe: T,
	{ servings = 1 }: { servings?: number } = {},
): RecipeMetrics {
	const volumes = calculateSpecsVolumes(recipe.specs, servings);

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

	const dilutionOfOriginalVolume = getDefaultDilution(recipe.preparationMethod);

	const dilutionVolume = volumes.totalLiquidVolume * dilutionOfOriginalVolume;
	const finalVolume = volumes.totalLiquidVolume + dilutionVolume;
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
