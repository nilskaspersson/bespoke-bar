import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { useFormatSpecMeasure } from "@/features/specs/hooks/useFormatSpecMeasure";
import type { UnitSystems } from "@/features/units/utils/convert";

export function useGetSpecsToText<T extends DraftSpecWithDraftIngredient>(
	servings: number = 1,
	convertUnits?: UnitSystems | null,
): (specs: T[] | undefined) => string | null {
	const formatSpecMeasure = useFormatSpecMeasure();

	return (specs: T[] | undefined) => {
		if (!specs || specs.length === 0) {
			return null;
		}

		return specs
			.map(
				(spec) =>
					`${formatSpecMeasure({ spec, servings, convertUnits })} ${spec.ingredient.name}`,
			)
			.join("\n");
	};
}
