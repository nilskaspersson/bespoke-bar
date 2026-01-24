import { EntityActions } from "@/components/EntityActions";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";

import { RemoveListEntryButton } from "@/features/lists/actions/components/RemoveListEntryButton";
import { addRecipeToList } from "@/features/lists/entries/api/addRecipeToList";
import { removeRecipeFromList } from "@/features/lists/entries/api/removeRecipeFromList";
import { UpdateRecipeEntryFormDialog } from "@/features/lists/entries/components/UpdateRecipeEntryFormDialog";

import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { ToggleDrawerButton } from "@/ui/ToggleDrawerButton";

export function ListEntryActions({
	entry,
}: {
	entry: RecipeListEntryWithRecipe;
}) {
	return (
		<EntityActions gap={2} actionProps={{ variant: "outline", color: "light" }}>
			{(actionProps) => (
				<>
					<li>
						<ToggleDrawerButton {...actionProps} label="Update price">
							<UpdateRecipeEntryFormDialog
								entry={entry}
								key={entry.updatedAt?.toISOString()}
							/>
						</ToggleDrawerButton>
					</li>

					<li>
						<LinkButton
							{...actionProps}
							href={`/bar/recipes/${entry.recipe.id}/edit`}
						>
							Edit recipe
						</LinkButton>
					</li>

					<li>
						<RemoveListEntryButton
							{...actionProps}
							entry={entry}
							actionRemove={removeRecipeFromList}
							actionAdd={addRecipeToList}
						>
							<Icon name="xmark" />
							Remove from list
						</RemoveListEntryButton>
					</li>
				</>
			)}
		</EntityActions>
	);
}
