import type { ReactNode } from "react";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";
import { ListEntryActions } from "@/features/lists/actions/components/ListEntryActions";
import { RecipeEntryNameAdornment } from "@/features/lists/entries/components/RecipeEntryNameAdornment";
import { RecipeCard } from "@/features/recipes/components/RecipeCard";
import { Grid } from "@/ui/Grid";

type Props = {
	entry: RecipeListEntryWithRecipe;
	className?: string;
	editable?: boolean;
	withActions?: boolean;
	children?: ReactNode;
};

export function RecipeListEntryCard({
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
					<RecipeEntryNameAdornment entry={entry} editable={editable} />
				}
			>
				{children}
			</RecipeCard>
			{withActions ? <ListEntryActions entry={entry} /> : null}
		</Grid>
	);
}
