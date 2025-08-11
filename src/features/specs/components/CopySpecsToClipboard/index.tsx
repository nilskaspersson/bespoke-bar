"use client";

import type { ComponentProps } from "react";
import type { DraftSpecWithDraftIngredient } from "@/db/schema/specs";
import { useGetSpecsToText } from "@/features/specs/hooks/useGetSpecsToText";
import type { UnitSystems } from "@/features/units/utils/convert";
import { CopyToClipboard } from "@/ui/CopyToClipboard";

export function CopySpecsToClipboard({
	specs,
	children,
	servings,
	convertUnits,
	...props
}: Omit<ComponentProps<typeof CopyToClipboard>, "getValue"> & {
	specs: DraftSpecWithDraftIngredient[];
	servings?: number;
	convertUnits?: UnitSystems | null;
}) {
	const getSpecsToText = useGetSpecsToText(servings, convertUnits);

	return (
		<CopyToClipboard {...props} getValue={() => getSpecsToText(specs)}>
			{children}
		</CopyToClipboard>
	);
}
