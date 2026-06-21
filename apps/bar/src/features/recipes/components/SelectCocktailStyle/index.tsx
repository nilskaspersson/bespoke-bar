"use client";

import {
	type CocktailStyle,
	cocktailStyles,
} from "@bespoke/schema/schema/cocktailStyles";
import type { ComponentProps } from "react";
import { COCKTAIL_STYLE_TO_LABEL } from "@/features/recipes/constants";
import { Combobox } from "@/ui/Combobox";
import { collator } from "@/utils/collator";
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
