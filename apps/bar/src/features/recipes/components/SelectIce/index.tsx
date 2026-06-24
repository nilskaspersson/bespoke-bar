"use client";

import { type Ice, ice } from "@bespoke/schema/schema/ice";
import { Select } from "@bespoke/ui/Select";
import type { ComponentProps } from "react";
import { ICE_TO_LABEL } from "@/features/recipes/constants";
import { withKey } from "@/utils/withKey";

type Option = {
	value: Ice;
	label: React.ReactNode;
};

const getItemValue = (item: Option) => item.value;
const getItemLabel = (item: Option) => item.label;

const itemToString = (item: Option | null) =>
	!item ? "" : (ICE_TO_LABEL.get(item.value) ?? item.value);

// Enum order (none → cubed → crushed), least to most ice — not alphabetical.
const OPTIONS = ice.options.map((item) =>
	withKey({ value: item, label: ICE_TO_LABEL.get(item) ?? item }),
);

export function SelectIce(
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
