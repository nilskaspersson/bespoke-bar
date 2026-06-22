import { collator } from "@bespoke/domain/utils/collator";
import type { MenuWithEntries } from "@bespoke/schema/schema/composite";
import { Combobox } from "@bespoke/ui/Combobox";
import { Icon } from "@bespoke/ui/Icon";
import { Menu } from "@bespoke/ui/Menu";
import { clsx } from "clsx";
import { type ComponentProps, useMemo } from "react";
import { getMenuName } from "@/features/menus/utils";
import { RecipesCountBadge } from "@/features/recipes/components/RecipesCountBadge";
import styles from "./styles.module.css";

const itemToString = (item: MenuWithEntries | null) =>
	!item ? "" : (item.name ?? "");
const getItemValue = (item: MenuWithEntries) => item.id;

const getItemLabel = (item: MenuWithEntries) => (
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

export function SelectMenu({
	menus,
	...props
}: { menus: MenuWithEntries[] | undefined } & Omit<
	ComponentProps<typeof Combobox<MenuWithEntries>>,
	"items" | "itemToString" | "getItemValue" | "getItemLabel"
>) {
	const options = useMemo(
		() =>
			menus?.sort((a, b) => {
				// Featured menus first
				if (a.isFeatured && !b.isFeatured) return -1;
				if (!a.isFeatured && b.isFeatured) return 1;

				return collator.compare(getMenuName(a), getMenuName(b));
			}) ?? [],
		[menus],
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
