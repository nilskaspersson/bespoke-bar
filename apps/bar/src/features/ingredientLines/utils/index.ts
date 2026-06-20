import type { DraftIngredientLine } from "@/db/schema/ingredientLines";

export function lineIsDraft<T extends DraftIngredientLine>(line: T) {
	return line.ingredientId == null;
}

export function hasNoLines(lines: DraftIngredientLine[] | undefined) {
	return lines == null || lines.length === 0;
}
