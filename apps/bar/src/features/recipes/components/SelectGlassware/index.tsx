"use client";

import { GLASSWARE_TO_LABEL } from "@bespoke/domain/recipes/labels";
import { collator } from "@bespoke/domain/utils/collator";
import { withKey } from "@bespoke/domain/utils/withKey";
import { type Glassware, glasswares } from "@bespoke/schema/schema/glassware";
import { Combobox } from "@bespoke/ui/Combobox";
import type { ComponentProps } from "react";

type Option = {
	value: Glassware;
	label: React.ReactNode;
};

const getItemValue = (item: Option) => item.value;

const itemToString = (item: Option | null) =>
	!item ? "" : (GLASSWARE_TO_LABEL.get(item.value) ?? item.value);

const OPTIONS = glasswares.options
	.map((item) =>
		withKey({
			value: item,
			label: GLASSWARE_TO_LABEL.get(item) ?? item,
		}),
	)
	.sort((a, b) => collator.compare(itemToString(a), itemToString(b)));

export function SelectGlassware(
	props: Omit<
		ComponentProps<typeof Combobox<Option>>,
		"items" | "itemToString" | "getItemValue" | "getItemLabel"
	>,
) {
	return (
		<Combobox
			items={OPTIONS}
			itemToString={itemToString}
			getItemValue={getItemValue}
			{...props}
		/>
	);
}
