"use client";

import { COCKTAIL_STYLE_TO_LABEL } from "@bespoke/domain/recipes/labels";
import { collator } from "@bespoke/domain/utils/collator";
import {
	type CocktailStyle,
	cocktailStyles,
} from "@bespoke/schema/schema/cocktailStyles";
import { Combobox } from "@bespoke/ui/Combobox";
import type { ComponentProps } from "react";
import { withKey } from "@/utils/withKey";

type Option = {
	value: CocktailStyle;
	label: React.ReactNode;
};

const getItemValue = (item: Option) => item.value;

const itemToString = (item: Option | null) =>
	!item ? "" : (COCKTAIL_STYLE_TO_LABEL.get(item.value) ?? item.value);

const OPTIONS = cocktailStyles.options
	.map((item) =>
		withKey({
			value: item,
			label: COCKTAIL_STYLE_TO_LABEL.get(item) ?? item,
		}),
	)
	.sort((a, b) => collator.compare(itemToString(a), itemToString(b)));

export function SelectCocktailStyle(
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
