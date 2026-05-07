"use client";

import { EntityActions } from "@/components/EntityActions";
import type { RecipeListEntryWithRecipe } from "@/db/schema/recipeListEntries";

import { RemoveListEntryButton } from "@/features/lists/actions/components/RemoveListEntryButton";
import { addRecipeToList } from "@/features/lists/entries/api/addRecipeToList";
import { removeRecipeFromList } from "@/features/lists/entries/api/removeRecipeFromList";
import { UpdateEntryDialog } from "@/features/lists/entries/components/UpdateEntryDialog";

import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";

export function ListEntryActions({
	entry,
}: {
	entry: RecipeListEntryWithRecipe;
}) {
	return (
		<EntityActions>
			{(actionProps) => (
				<>
					<li>
						<UpdateEntryDialog entry={entry} {...actionProps}>
							Update price
						</UpdateEntryDialog>
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
