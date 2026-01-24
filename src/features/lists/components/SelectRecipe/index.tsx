import { type ComponentProps, useCallback, useMemo } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { getRecipeName, isRecipeWithSpecs } from "@/features/recipes/utils";
import { useGetSpecsToText } from "@/features/specs/hooks/useGetSpecsToText";
import { Combobox } from "@/ui/Combobox";
import { OptionLabel } from "@/ui/OptionLabel";
import { collator } from "@/utils/collator";

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
	const specsToText = useGetSpecsToText(1, null, ", ");

	const getItemLabel = useCallback(
		(item: Recipe) => {
			return (
				<OptionLabel
					description={isRecipeWithSpecs(item) ? specsToText(item.specs) : null}
				>
					{getRecipeName(item)}
				</OptionLabel>
			);
		},
		[specsToText],
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
