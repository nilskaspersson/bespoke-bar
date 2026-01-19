"use client";

import { use, useCallback } from "react";
import type { DraftSpec } from "@/db/schema/specs";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { FormatterContext } from "@/hooks/useFormatter";

export function useGetSpecMeasure<T extends DraftSpec>() {
	const { quantityFormatter } = use(FormatterContext);

	return useCallback(
		(spec: T, servings: number) => {
			return `${spec.quantity ? quantityFormatter.format(spec.quantity * servings) : ""} ${getFormattedUnit(spec.unit, spec.quantity)}`;
		},
		[quantityFormatter],
	);
}
