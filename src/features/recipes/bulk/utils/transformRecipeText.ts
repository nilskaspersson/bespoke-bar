import type { Unit } from "@/db/schema/units";
import { quantityTextParser } from "@/features/quantity/utils/parseQuantity";
import { quantityToBestUnit } from "@/features/units/hooks/useQuantityToBestUnit";
import type { UnitSystems } from "@/features/units/utils/convert";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { getUnitSystemFromUnit } from "@/features/units/utils/getUnitSystemFromUnit";
import { unitTextParser } from "@/features/units/utils/parseUnit";
import { snapQuantity } from "@/features/units/utils/snapQuantity";
import { round } from "@/utils";

// ─── Helpers ────────────────────────────────────────────────

const LINE_PREFIX = /^(\s*(?:[-*]\s*)?)/;

function parseLine(line: string) {
	const prefix = line.match(LINE_PREFIX)?.[0] ?? "";
	const content = line.slice(prefix.length);

	if (!content.trim()) return null;

	const [quantity, qRemainder] = quantityTextParser(content);
	if (quantity === null) return null;

	const trimmed = qRemainder.trimStart();
	const [unit, uRemainder] = unitTextParser(trimmed);

	const ingredient = (unit !== null ? uRemainder : trimmed).trimStart();

	return { prefix, quantity, unit, ingredient };
}

function buildLine(
	prefix: string,
	qty: number,
	unit: Unit,
	ingredient: string,
): string {
	const parts = [qty.toString(), getFormattedUnit(unit, qty)];
	if (ingredient) parts.push(ingredient);
	return prefix + parts.join(" ");
}

function capitalizeWords(text: string): string {
	return text.replace(/(^|\s)\w/g, (c) => c.toUpperCase());
}

// ─── Transformations ────────────────────────────────────────

export function convertLine(line: string, targetSystem: UnitSystems): string {
	const parsed = parseLine(line);
	if (!parsed?.unit) return line;

	const result = quantityToBestUnit({
		quantity: parsed.quantity,
		unit: parsed.unit,
		unitSystem: targetSystem,
	});
	if (!result) return line;

	const [qty, unit] = result;
	return buildLine(parsed.prefix, round(qty), unit, parsed.ingredient);
}

export function roundLine(line: string): string {
	const parsed = parseLine(line);
	if (!parsed?.unit) return line;

	const currentSystem = getUnitSystemFromUnit(parsed.unit);
	const result = quantityToBestUnit({
		quantity: parsed.quantity,
		unit: parsed.unit,
		unitSystem: currentSystem,
	});
	if (!result) return line;

	const [qty, unit] = result;
	return buildLine(
		parsed.prefix,
		snapQuantity(qty, unit),
		unit,
		parsed.ingredient,
	);
}

export function capitalizeLine(line: string): string {
	const prefix = line.match(LINE_PREFIX)?.[0] ?? "";
	const content = line.slice(prefix.length);
	if (!content.trim()) return line;

	const parsed = parseLine(line);

	if (!parsed) {
		// Recipe name — capitalize in-place
		return prefix + capitalizeWords(content);
	}

	if (!parsed.ingredient) return line;

	// Only capitalize the ingredient portion, preserve everything else as-is
	const trimmedLine = line.trimEnd();
	const trimmedIngredient = parsed.ingredient.trimEnd();
	const ingredientStart = trimmedLine.length - trimmedIngredient.length;
	const trailing = line.slice(trimmedLine.length);

	return (
		line.slice(0, ingredientStart) +
		capitalizeWords(trimmedIngredient) +
		trailing
	);
}
