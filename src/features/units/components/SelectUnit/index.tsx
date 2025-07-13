"use client";

import type { ComponentProps } from "react";
import { supportedUnits, type Unit } from "@/db/schema/units";
import { Select } from "@/ui/Select";
import { collator } from "@/utils/collator";
import { type Keyed, withKey } from "@/utils/withKey";

type Option = {
	value: Unit | "";
	label: React.ReactNode;
};

const getItemValue = (item: Option) => item.value;
const getItemLabel = (item: Option) => item.label;
const itemToString = (item: Option | null) => (!item ? "" : item.value);

const OPTIONS: Keyed<Option>[] = [
	withKey({ value: "", label: "None" }),
	...supportedUnits.options
		.map((item) =>
			withKey({
				value: item,
				label: item,
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
