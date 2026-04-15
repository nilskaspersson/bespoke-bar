"use client";

import type { ComponentProps } from "react";
import type { Unit } from "@/db/schema/units";
import { getUnitLabel } from "@/features/units/constants";
import { OptionsList } from "@/ui/OptionsList";

export function UnitOption({
	unit,
	...props
}: { unit: Unit } & ComponentProps<typeof OptionsList.Item>) {
	return (
		<OptionsList.Item {...props}>
			<OptionsList.Label>{getUnitLabel(unit)}</OptionsList.Label>
		</OptionsList.Item>
	);
}
