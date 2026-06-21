import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";
import { clsx } from "clsx";
import { MenuEntryActions } from "@/features/menus/actions/components/MenuEntryActions";
import { MenuEntryNameAdornment } from "@/features/menus/entries/components/MenuEntryNameAdornment";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Grid } from "@/ui/Grid";
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
				<Grid as="li" key={entry.id} gap={1}>
					<RecipeCard
						recipe={entry}
						nameAdornment={
							<MenuEntryNameAdornment entry={entry} editable={editable} />
						}
					/>

					{withActions ? <MenuEntryActions entry={entry} /> : null}
				</Grid>
			))}
		</ul>
	);
}
