import { type ComponentProps, useCallback, useMemo } from "react";
import type { Recipe } from "@/db/schema/recipes";
import { Combobox } from "@/ui/Combobox";
import { OptionLabel } from "@/ui/OptionLabel";
import { collator } from "@/utils/collator";

const itemToString = (item: Recipe | null) => (!item ? "" : (item.name ?? ""));
const getItemValue = (item: Recipe) => item.id;

export function SelectRecipe({
	recipes,
	...props
}: { recipes: Recipe[] | undefined } & Omit<
	ComponentProps<typeof Combobox<Recipe>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const getItemLabel = useCallback((item: Recipe) => {
		return <OptionLabel>{item.name}</OptionLabel>;
	}, []);

	const options = useMemo(
		() =>
			recipes?.sort((a, b) => collator.compare(a.name ?? "", b.name ?? "")) ??
			[],
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
