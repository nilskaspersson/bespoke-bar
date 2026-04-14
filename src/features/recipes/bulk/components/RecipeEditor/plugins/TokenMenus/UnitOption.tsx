"use client";

import type { MouseEventHandler, Ref } from "react";
import type { Unit } from "@/db/schema/units";
import { UNIT_TO_LABEL } from "@/features/units/constants";
import { OptionsList } from "@/ui/OptionsList";

export function UnitOption({
	unit,
	isHighlighted,
	onClick,
	onMouseEnter,
	ref,
}: {
	unit: Unit;
	isHighlighted: boolean;
	onClick: MouseEventHandler<HTMLLIElement>;
	onMouseEnter: MouseEventHandler<HTMLLIElement>;
	ref?: Ref<HTMLLIElement>;
}) {
	return (
		<OptionsList.Item
			ref={ref}
			isHighlighted={isHighlighted}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
		>
			<OptionsList.Label>{UNIT_TO_LABEL.get(unit) ?? unit}</OptionsList.Label>
		</OptionsList.Item>
	);
}
