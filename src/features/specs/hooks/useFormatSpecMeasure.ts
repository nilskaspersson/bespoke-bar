import { useCallback } from "react";
import type { DraftSpec } from "@/db/schema/specs";
import { useGetSpecMeasure } from "@/features/specs/hooks/useGetSpecMeasure";
import { useQuantityToBestUnit } from "@/features/units/hooks/useQuantityToBestUnit";
import type { UnitSystems } from "@/features/units/utils/convert";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";

export function useFormatSpecMeasure<T extends DraftSpec>() {
	const quantityToBestUnit = useQuantityToBestUnit();
	const getSpecMeasure = useGetSpecMeasure();

	return useCallback(
		({
			spec,
			servings,
			convertUnits,
		}: {
			spec: T;
			servings: number;
			convertUnits?: UnitSystems | null;
		}) => {
			const unitSystem = convertUnits
				? convertUnits
				: getUnitSystemFromUnit(spec.unit);

			return convertUnits
				? quantityToBestUnit({
						quantity: spec.quantity,
						unit: spec.unit,
						unitSystem,
						servings,
					})
				: getSpecMeasure(spec, servings);
		},
		[quantityToBestUnit, getSpecMeasure],
	);
}
