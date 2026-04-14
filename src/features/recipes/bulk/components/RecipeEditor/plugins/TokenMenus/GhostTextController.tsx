"use client";

import { getGhostCompletion } from "@/features/recipes/bulk/utils/getGhostCompletion";
import { useGhostText } from "../../hooks/useGhostText";

/**
 * Writes the completion suffix of the currently highlighted option as
 * `data-ghost` on the caret's text node. Works for any menu whose items
 * can be projected to a display label via `getLabel` — the ingredient
 * typeahead passes `option.ingredient.name`, the unit typeahead passes
 * its label lookup.
 */
export function GhostTextController<T>({
	query,
	options,
	selectedIndex,
	getLabel,
}: {
	query: string | null;
	options: T[];
	selectedIndex: number | null;
	getLabel: (option: T) => string;
}) {
	const active = options[selectedIndex ?? 0];
	const ghostText =
		query && active ? getGhostCompletion(query, getLabel(active)) : null;
	useGhostText(ghostText);
	return null;
}
