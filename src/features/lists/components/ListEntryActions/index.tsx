import { EntityActions } from "@/app/components/EntityActions";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";

import { addRecipeToList } from "@/features/lists/api/addRecipeToList";
import { removeRecipeFromList } from "@/features/lists/api/removeRecipeFromList";
import { RemoveListEntryButton } from "@/features/lists/components/RemoveListEntryButton";
import { UpdateRecipeEntryFormDialog } from "@/features/lists/components/UpdateRecipeEntryFormDialog";

import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { ToggleModalButton } from "@/ui/ToggleModalButton";

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
						<ToggleModalButton {...actionProps} label="Update price">
							<UpdateRecipeEntryFormDialog entry={entry} />
						</ToggleModalButton>
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
