import { clsx } from "clsx";
import type { MenuEntryWithRecipe } from "@/db/schema/menuEntries";
import { MenuEntryCard } from "@/features/menus/entries/components/MenuEntryCard";
import styles from "./styles.module.css";

export function MenuEntryList({
	entries,
	editable,
	withActions,
	className,
}: {
	entries: MenuEntryWithRecipe[];
	editable?: boolean;
	withActions?: boolean;
	className?: string;
}) {
	if (entries.length === 0) {
		return null;
	}

	return (
		<ul className={clsx(styles.recipes, className)}>
			{entries.map((entry) => (
				<li key={entry.id}>
					<MenuEntryCard
						entry={entry}
						editable={editable}
						withActions={withActions}
					/>
				</li>
			))}
		</ul>
	);
}
