"use client";

import type { ComponentProps } from "react";
import { systemCategories } from "@/db/schema/categories";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { Combobox } from "@/ui/Combobox";
import { collator } from "@/utils/collator";
import { withKey } from "@/utils/withKey";

const OPTIONS = systemCategories.options
	.map((item) =>
		withKey({
			value: item,
			label: CATEGORY_TO_LABEL.get(item) ?? item,
		}),
	)
	.sort((a, b) => collator.compare(a.label, b.label));

type Option = (typeof OPTIONS)[number];

const getItemLabel = (item: Option) => item.label;
const getItemValue = (item: Option) => item.value;
const itemToString = (item: Option | null) => item?.label ?? "";

export function SelectCategory(
	props: Partial<ComponentProps<typeof Combobox<Option>>>,
) {
	return (
		<Combobox
			name="category"
			label="Category"
			items={OPTIONS}
			getItemLabel={getItemLabel}
			getItemValue={getItemValue}
			itemToString={itemToString}
			{...props}
		/>
	);
}
