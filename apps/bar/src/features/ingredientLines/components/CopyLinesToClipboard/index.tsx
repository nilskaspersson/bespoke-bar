"use client";

import type { UnitSystems } from "@bespoke/domain/units/convert";
import type { DraftIngredientLineWithDraftIngredient } from "@bespoke/schema/schema/ingredientLines";
import { CopyToClipboard } from "@bespoke/ui/CopyToClipboard";
import type { ComponentProps } from "react";
import { useLinesToText } from "@/features/ingredientLines/hooks/useLinesToText";

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
