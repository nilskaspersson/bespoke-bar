"use client";

import { isValidUnit } from "@bespoke/domain/units/predicates";
import { collator } from "@bespoke/domain/utils/collator";
import { supportedUnits, type Unit } from "@bespoke/schema/schema/units";
import type { Keyed } from "@bespoke/schema/types";
import { Select } from "@bespoke/ui/Select";
import type { ComponentProps } from "react";
import { getUnitLabel } from "@/features/units/constants";
import { withKey } from "@/utils/withKey";

type Option = {
	value: Unit | "";
	label: string;
};

const getItemValue = (item: Option) => item.value;
const getItemLabel = (item: Option) => item.label;
const itemToString = (item: Option | null) => (!item ? "" : item.label);

const OPTIONS: Keyed<Option>[] = [
	withKey({ value: "", label: "None" }),
	...supportedUnits.options
		.map((item) =>
			withKey({
				value: item,
				label: isValidUnit(item) ? getUnitLabel(item) : item,
			}),
		)
		.sort((a, b) => collator.compare(itemToString(a), itemToString(b))),
];

export function SelectUnit(
	props: Omit<
		ComponentProps<typeof Select<Option>>,
		"items" | "itemToString" | "getItemValue" | "getItemLabel"
	>,
) {
	return (
		<Select
			items={OPTIONS}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			{...props}
		/>
	);
}
