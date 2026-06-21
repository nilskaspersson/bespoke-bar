import { collator } from "@bespoke/domain/utils/collator";
import type { Recipe } from "@bespoke/schema/schema/recipes";
import { type ComponentProps, useCallback, useMemo } from "react";
import { useLinesToText } from "@/features/ingredientLines/hooks/useLinesToText";
import { getRecipeName, isRecipeWithLines } from "@/features/recipes/utils";
import { Combobox } from "@/ui/Combobox";
import { Menu } from "@/ui/Menu";

const itemToString = (item: Recipe | null) =>
	!item ? "" : getRecipeName(item);
const getItemValue = (item: Recipe) => item.id;

export function SelectRecipe({
	recipes,
	...props
}: { recipes: Recipe[] | undefined } & Omit<
	ComponentProps<typeof Combobox<Recipe>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const linesToText = useLinesToText(1, null, ", ");

	const getItemLabel = useCallback(
		(item: Recipe) => {
			return (
				<Menu.Label
					description={isRecipeWithLines(item) ? linesToText(item.lines) : null}
				>
					{getRecipeName(item)}
				</Menu.Label>
			);
		},
		[linesToText],
	);

	const options = useMemo(
		() =>
			recipes?.sort((a, b) =>
				collator.compare(getRecipeName(a), getRecipeName(b)),
			) ?? [],
		[recipes],
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
