import type { ReactNode } from "react";
import type { MenuEntryWithRecipe } from "@/db/schema/menuEntries";
import { MenuEntryActions } from "@/features/menus/actions/components/MenuEntryActions";
import { MenuEntryNameAdornment } from "@/features/menus/entries/components/MenuEntryNameAdornment";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Grid } from "@/ui/Grid";

type Props = {
	entry: MenuEntryWithRecipe;
	className?: string;
	editable?: boolean;
	withActions?: boolean;
	children?: ReactNode;
};

export function MenuEntryCard({
	entry,
	className,
	editable,
	children,
	withActions,
}: Props) {
	return (
		<Grid gap={1}>
			<RecipeCard
				className={className}
				recipe={entry.recipe}
				nameAdornment={
					<MenuEntryNameAdornment entry={entry} editable={editable} />
				}
			>
				{children}
			</RecipeCard>
			{withActions ? <MenuEntryActions entry={entry} /> : null}
		</Grid>
	);
}
