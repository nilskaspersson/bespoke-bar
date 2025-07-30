import { clsx } from "clsx";
import { type ComponentProps, useMemo } from "react";
import type { RecipeListWithCount } from "@/db/schema/recipeLists";
import { RecipesCountBadge } from "@/features/recipes/components/RecipesCountBadge";
import { Combobox } from "@/ui/Combobox";
import { Icon } from "@/ui/Icon";
import { OptionLabel } from "@/ui/OptionLabel";
import { collator } from "@/utils/collator";
import styles from "./styles.module.css";

const itemToString = (item: RecipeListWithCount | null) =>
	!item ? "" : (item.name ?? "");
const getItemValue = (item: RecipeListWithCount) => item.id;

const getItemLabel = (item: RecipeListWithCount) => (
	<OptionLabel className={styles.label} description={item.description}>
		<Icon
			className={clsx(styles.icon, {
				[styles.isFeatured]: item.isFeatured,
			})}
			name={item.isFeatured ? "star" : "memo-pad"}
			size={2}
		/>

		<span className={styles.name}>{item.name}</span>

		<RecipesCountBadge count={item.recipeCount} size={0} />
	</OptionLabel>
);

export function SelectRecipeList({
	lists,
	...props
}: { lists: RecipeListWithCount[] | undefined } & Omit<
	ComponentProps<typeof Combobox<RecipeListWithCount>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const options = useMemo(
		() =>
			lists?.sort((a, b) => {
				// Featured lists first
				if (a.isFeatured && !b.isFeatured) return -1;
				if (!a.isFeatured && b.isFeatured) return 1;

				// Then most recently updated/created lists
				return collator.compare(
					(b.updatedAt ?? b.createdAt)?.toISOString() ?? "",
					(a.updatedAt ?? a.createdAt)?.toISOString() ?? "",
				);
			}) ?? [],
		[lists],
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
