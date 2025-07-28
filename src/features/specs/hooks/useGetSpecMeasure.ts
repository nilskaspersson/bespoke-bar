"use client";

import { useCallback } from "react";
import type { DraftSpec } from "@/db/schema/specs";
import { getFormattedUnit } from "@/features/units/utils/getFormattedUnit";
import { useFormatter } from "@/hooks/useFormatter";

export function useGetSpecMeasure<T extends DraftSpec>() {
	const { quantityFormatter } = useFormatter();

	return useCallback(
		(spec: T, servings: number) => {
			return `${spec.quantity ? quantityFormatter.format(spec.quantity * servings) : ""} ${getFormattedUnit(spec.unit, spec.quantity)}`;
		},
		[quantityFormatter],
	);
}
