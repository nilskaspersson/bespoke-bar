"use client";

import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import type { ComponentProps } from "react";
import { useLinesToText } from "@/features/ingredientLines/hooks/useLinesToText";
import type { UnitSystems } from "@/features/units/utils/convert";
import { CopyToClipboard } from "@/ui/CopyToClipboard";

export function CopyLinesToClipboard({
	lines,
	children,
	servings,
	convertUnits,
	...props
}: Omit<ComponentProps<typeof CopyToClipboard>, "getValue"> & {
	lines: DraftIngredientLineWithDraftIngredient[];
	servings?: number;
	convertUnits?: UnitSystems | null;
}) {
	const getLinesToText = useLinesToText(servings, convertUnits);

	return (
		<CopyToClipboard {...props} getValue={() => getLinesToText(lines)}>
			{children}
		</CopyToClipboard>
	);
}
