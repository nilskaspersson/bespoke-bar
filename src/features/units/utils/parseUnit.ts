import type { Unit } from "@/db/schema/units";
import { ALIAS_TO_DB_VOLUME_UNIT } from "@/features/units/constants";
import { escapeRegex } from "@/utils";

/**
 * These are the units that are most likely to be used in a user input.
 */
const COMMON_UNITS = ["cl", "fl oz", "oz"];

const COMMON_UNITS_PATTERN = new RegExp(
	`(${COMMON_UNITS.map(escapeRegex).join("|")})(?=\\s|$)`,
	"i",
);

/**
 * All units except common ones (already handled in fast path)
 * Sorted to favor the more accurate aliases
 */
const UNCOMMON_MATCH_TERMS = Array.from(ALIAS_TO_DB_VOLUME_UNIT.keys())
	.filter((term) => !COMMON_UNITS.includes(term))
	.sort((a, b) => b.length - a.length);

const fullUnitPattern = new RegExp(
	`(${UNCOMMON_MATCH_TERMS.map(escapeRegex).join("|")})(?=\\s|$)`,
	"i",
);

const tryParseUnit = (text: string, pattern: RegExp): [Unit | null, string] => {
	const match = text.match(pattern);

	if (!match || match.index == null) {
		return [null, text];
	}

	const unit = ALIAS_TO_DB_VOLUME_UNIT.get(match[1].toLowerCase());

	if (!unit) {
		return [null, text];
	}

	const remainder = text.slice(match.index + match[0].length).trim();

	return [unit, remainder];
};

export function formatUnit(userInput: string): Unit | null {
	const [unit] = unitTextParser(userInput);
	return unit;
}

export function unitTextParser(userInput: string): [Unit | null, string] {
	const text = userInput.trim();

	if (!text) {
		return [null, text];
	}

	/**
	 * Fast path: Attempts to parse common units first
	 */
	const commonResult = tryParseUnit(text, COMMON_UNITS_PATTERN);

	if (commonResult[0] !== null) {
		return commonResult;
	}

	/**
	 * Slow path: Check all possible units and aliases
	 */
	return tryParseUnit(text, fullUnitPattern);
}
