"use client";

import { type ComponentProps, useCallback, useMemo } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { useFormatter } from "@/hooks/useFormatter";
import { Combobox } from "@/ui/Combobox";
import { OptionLabel } from "@/ui/OptionLabel";
import { collator } from "@/utils/collator";

const itemToString = (item: Ingredient | null) => (!item ? "" : item.name);
const getItemValue = (item: Ingredient) => item.id;

export function IngredientPicker({
	ingredients,
	...props
}: Omit<
	ComponentProps<typeof Combobox<Ingredient>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
> & {
	ingredients: Ingredient[];
}) {
	const { percentageFormatter } = useFormatter();

	const getItemLabel = useCallback(
		(item: Ingredient) => {
			const category = item.category
				? CATEGORY_TO_LABEL.get(item.category)
				: null;

			const abv = item.abv ? percentageFormatter.format(item.abv) : null;

			return (
				<OptionLabel description={[category, abv].filter(Boolean).join(", ")}>
					{item.name}
				</OptionLabel>
			);
		},
		[percentageFormatter],
	);

	const options = useMemo(
		() => ingredients.sort((a, b) => collator.compare(a.name, b.name)),
		[ingredients],
	);

	return (
		<Combobox
			items={options}
			itemToString={itemToString}
			getItemValue={getItemValue}
			getItemLabel={getItemLabel}
			{...props}
		/>
	);
}
