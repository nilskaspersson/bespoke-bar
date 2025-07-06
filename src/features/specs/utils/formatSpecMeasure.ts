import type { DraftSpec } from "@/db/schema/specs";
import type { UnitSystems } from "@/features/units/utils/convert";
import { quantityToBestUnit } from "@/features/units/utils/formatVolume";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { quantityFormatter } from "@/utils/formatting";

export function getSpecMeasure<T extends DraftSpec>(spec: T, servings: number) {
	return `${spec.quantity ? quantityFormatter.format(spec.quantity * servings) : ""} ${getFormattedUnit(spec.unit, spec.quantity)}`;
}

export function formatSpecMeasure<T extends DraftSpec>({
	spec,
	servings,
	convertUnits,
}: {
	spec: T;
	servings: number;
	convertUnits?: UnitSystems | null;
}) {
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
}
