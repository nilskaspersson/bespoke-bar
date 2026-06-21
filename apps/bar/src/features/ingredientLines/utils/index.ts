import type { DraftIngredientLine } from "@bespoke/schema/schema/ingredientLines";

export function lineIsDraft<T extends DraftIngredientLine>(line: T) {
	return line.ingredientId == null;
}

export function hasNoLines(lines: DraftIngredientLine[] | undefined) {
	return lines == null || lines.length === 0;
}
