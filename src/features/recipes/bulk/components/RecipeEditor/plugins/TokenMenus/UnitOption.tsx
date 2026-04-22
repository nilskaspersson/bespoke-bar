"use client";

import type { ComponentProps } from "react";
import type { Unit } from "@/db/schema/units";
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
