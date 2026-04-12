"use client";

import { getGhostCompletion } from "@/features/recipes/bulk/utils/getGhostCompletion";
import { useGhostText } from "../../hooks/useGhostText";
import type { IngredientMenuOption } from "./utils";

export function GhostTextController({
	query,
	options,
	selectedIndex,
}: {
	query: string | null;
	options: IngredientMenuOption[];
	selectedIndex: number | null;
}) {
	const active = options[selectedIndex ?? 0];
	const ghostText =
		query && active ? getGhostCompletion(query, active.ingredient.name) : null;
	useGhostText(ghostText);
	return null;
}
