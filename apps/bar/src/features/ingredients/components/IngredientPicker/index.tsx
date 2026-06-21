"use client";

import { collator } from "@bespoke/domain/utils/collator";
import type { Ingredient } from "@bespoke/schema/schema/ingredients";
import { type ComponentProps, use, useCallback, useMemo } from "react";
import { CATEGORY_TO_LABEL } from "@/features/ingredients/constants";
import { FormatterContext } from "@/hooks/useFormatter";
import { Combobox } from "@/ui/Combobox";
import { Menu } from "@/ui/Menu";

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
				<Menu.Label description={[category, abv].filter(Boolean).join(", ")}>
					{item.name}
				</Menu.Label>
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
