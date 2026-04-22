import { clsx } from "clsx";
import { type ComponentProps, useMemo } from "react";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { getListName } from "@/features/lists/utils";
import { RecipesCountBadge } from "@/features/recipes/components/RecipesCountBadge";
import { Combobox } from "@/ui/Combobox";
import { Icon } from "@/ui/Icon";
import { Menu } from "@/ui/Menu";
import { collator } from "@/utils/collator";
import styles from "./styles.module.css";

const itemToString = (item: RecipeListWithEntries | null) =>
	!item ? "" : (item.name ?? "");
const getItemValue = (item: RecipeListWithEntries) => item.id;

const getItemLabel = (item: RecipeListWithEntries) => (
	<Menu.Label className={styles.label} description={item.description}>
		<Icon
			className={clsx(styles.icon, {
				[styles.isFeatured]: item.isFeatured,
			})}
			name={item.isFeatured ? "star" : "memo-pad"}
			size={2}
		/>

		<span className={styles.name}>{item.name}</span>

		<RecipesCountBadge count={item.entries.length} size={0} />
	</Menu.Label>
);

export function SelectRecipeList({
	lists,
	...props
}: { lists: RecipeListWithEntries[] | undefined } & Omit<
	ComponentProps<typeof Combobox<RecipeListWithEntries>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const options = useMemo(
		() =>
			lists?.sort((a, b) => {
				// Featured lists first
				if (a.isFeatured && !b.isFeatured) return -1;
				if (!a.isFeatured && b.isFeatured) return 1;

				return collator.compare(getListName(a), getListName(b));
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
