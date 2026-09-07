"use client";

import { ICE_TO_LABEL } from "@bespoke/domain/recipes/labels";
import { withKey } from "@bespoke/domain/utils/withKey";
<<<<<<< HEAD
import { ICE_TYPES, type Ice } from "@bespoke/schema/schema/ice";
=======
import { type Ice, ice } from "@bespoke/schema/schema/ice";
>>>>>>> main
import { Select } from "@bespoke/ui/Select";
import type { ComponentProps } from "react";

type Option = {
	value: Ice;
	label: React.ReactNode;
};

const getItemValue = (item: Option) => item.value;
const getItemLabel = (item: Option) => item.label;

const itemToString = (item: Option | null) =>
	!item ? "" : (ICE_TO_LABEL.get(item.value) ?? item.value);

// Enum order (none → cubed → crushed), least to most ice — not alphabetical.
const OPTIONS = ICE_TYPES.map((item) =>
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
