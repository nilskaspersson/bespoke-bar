import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";
import { Grid } from "@bespoke/ui/Grid";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { MenuEntryActions } from "@/features/menus/actions/components/MenuEntryActions";
import { MenuEntryNameAdornment } from "@/features/menus/entries/components/MenuEntryNameAdornment";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import styles from "./styles.module.css";

export function MenuEntryList({
	entries,
	editable,
	withActions,
	trailingSlot,
	className,
}: {
	entries: MenuEntryWithRecipe[];
	editable?: boolean;
	withActions?: boolean;
	trailingSlot?: ReactNode;
	className?: string;
}) {
	if (entries.length === 0 && !trailingSlot) {
		return null;
	}

	return (
		<ul className={clsx(styles.recipes, className)}>
			{entries.map((entry) => (
				<Grid as="li" key={entry.id} gap={1} className={styles.item}>
					<RecipeCard
						recipe={entry.recipe}
						nameAdornment={
							<MenuEntryNameAdornment entry={entry} editable={editable} />
						}
					/>

					{withActions ? <MenuEntryActions entry={entry} /> : null}
				</Grid>
			))}

			{trailingSlot ? <li className={styles.item}>{trailingSlot}</li> : null}
		</ul>
	);
}
