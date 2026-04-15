"use client";

import { type ComponentProps, use, useCallback, useMemo } from "react";
import type { Ingredient } from "@/db/schema/ingredients";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { FormatterContext } from "@/hooks/useFormatter";
import { Combobox } from "@/ui/Combobox";
import { OptionsList } from "@/ui/OptionsList";
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
	const { percentageFormatter } = use(FormatterContext);

	const getItemLabel = useCallback(
		(item: Ingredient) => {
			const category = item.category
				? CATEGORY_TO_LABEL.get(item.category)
				: null;

			const abv = item.abv ? percentageFormatter.format(item.abv) : null;

			return (
				<OptionsList.Label
					description={[category, abv].filter(Boolean).join(", ")}
				>
					{item.name}
				</OptionsList.Label>
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
