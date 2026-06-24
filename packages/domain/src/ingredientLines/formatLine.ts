import type { IngredientLine } from "@bespoke/schema/schema/ingredientLines";
import { getFormattedUnit } from "../units/getFormattedUnit";

/** "2 cl Aperol" — quantity, formatted unit, and name joined by spaces; empty parts dropped. */
export function formatLine(
	line: Pick<IngredientLine, "quantity" | "unit"> & { name?: string | null },
): string {
	const parts: string[] = [];

	if (line.quantity != null) {
		parts.push(String(line.quantity));
	}

	const unit = getFormattedUnit(line.unit, line.quantity);
	if (unit) {
		parts.push(unit);
	}

	if (line.name) {
		parts.push(line.name);
	}

	return parts.join(" ");
}
