"use client";

import type { Unit } from "@bespoke/schema/schema/units";
import { Menu } from "@bespoke/ui/Menu";
import type { ComponentProps } from "react";
import { getUnitLabel } from "@/features/units/constants";

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
