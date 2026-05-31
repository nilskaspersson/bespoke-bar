import type { Spec } from "@/db/schema/specs";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";

/** "2 cl Aperol" — quantity, formatted unit, and name joined by spaces; empty parts dropped. */
export function formatSpecLine(
	spec: Pick<Spec, "quantity" | "unit"> & { name?: string | null },
): string {
	const parts: string[] = [];

	if (spec.quantity != null) {
		parts.push(String(spec.quantity));
	}

	const unit = getFormattedUnit(spec.unit, spec.quantity);
	if (unit) {
		parts.push(unit);
	}

	if (spec.name) {
		parts.push(spec.name);
	}

	return parts.join(" ");
}
