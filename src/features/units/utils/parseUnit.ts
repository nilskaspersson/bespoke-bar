import type { Unit } from "@/db/schema/units";
import { ALIAS_TO_DB_VOLUME_UNIT } from "@/features/units/constants";
import { escapeRegex } from "@/utils";
import type { Parser } from "@/utils/sequencedParsers";

/**
 * These are the units that are most likely to be used in a user input.
 */
const COMMON_UNITS = ["cl", "fl oz", "oz"] as const;

const COMMON_UNITS_PATTERN = new RegExp(
	`(${COMMON_UNITS.map(escapeRegex).join("|")})(?=\\s|$)`,
	"i",
);

/**
 * Sorted to favor the more accurate aliases
 */
const ALL_MATCH_TERMS = Array.from(ALIAS_TO_DB_VOLUME_UNIT.keys()).sort(
	(a, b) => b.length - a.length,
);

const fullUnitPattern = new RegExp(
	`(${ALL_MATCH_TERMS.map(escapeRegex).join("|")})(?=\\s|$)`,
	"i",
);

export const parseUnit: Parser<Unit | null> = (userInput: string) => {
	const text = userInput.trim();

	if (!text) {
		return [null, text];
	}

	let match: RegExpMatchArray | null;

	/**
	 * Fast path: Attempts to parse common units first
	 */
	match = text.match(COMMON_UNITS_PATTERN);

	if (match && match.index != null) {
		const matchedUnit = match[1].toLowerCase();
		const remainder = text.slice(match.index + match[0].length).trim();

		const unit = ALIAS_TO_DB_VOLUME_UNIT.get(matchedUnit);

		return [unit ?? null, remainder];
	}

	/**
	 * Slow path: Check all possible units and aliases
	 */
	match = text.match(fullUnitPattern);

	if (match && match.index != null) {
		const matchedText = match[1].toLowerCase();
		const unit = ALIAS_TO_DB_VOLUME_UNIT.get(matchedText);

		if (unit) {
			const remainder = text.slice(match.index + match[0].length).trim();
			return [unit, remainder];
		}
	}

	return [null, text];
};
