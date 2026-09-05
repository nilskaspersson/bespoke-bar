"use client";

import { getUnitLabel } from "@bespoke/domain/units/labels";
import type { Unit } from "@bespoke/schema/schema/units";
import type { ComponentProps } from "react";
import { Menu } from "../../../Menu";

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
