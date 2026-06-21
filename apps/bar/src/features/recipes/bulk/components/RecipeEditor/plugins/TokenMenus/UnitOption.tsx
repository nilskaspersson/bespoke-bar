"use client";

import type { Unit } from "@bespoke/schema/schema/units";
import type { ComponentProps } from "react";
import { getUnitLabel } from "@/features/units/constants";
import { Menu } from "@/ui/Menu";

export function UnitOption({
	unit,
	...props
}: { unit: Unit } & ComponentProps<typeof Menu.Item>) {
	return (
		<Menu.Item {...props}>
			<Menu.Label>{getUnitLabel(unit)}</Menu.Label>
		</Menu.Item>
	);
}
