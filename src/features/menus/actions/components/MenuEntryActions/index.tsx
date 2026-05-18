"use client";

import { EntityActions } from "@/components/EntityActions";
import type { MenuEntryWithRecipe } from "@/db/schema/menuEntries";

import { RemoveMenuEntryButton } from "@/features/menus/actions/components/RemoveMenuEntryButton";
import { addRecipeToMenu } from "@/features/menus/entries/api/addRecipeToMenu";
import { removeRecipeFromMenu } from "@/features/menus/entries/api/removeRecipeFromMenu";
import { UpdateEntryDialog } from "@/features/menus/entries/components/UpdateEntryDialog";

import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";

export function MenuEntryActions({ entry }: { entry: MenuEntryWithRecipe }) {
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
						<RemoveMenuEntryButton
							{...actionProps}
							entry={entry}
							actionRemove={removeRecipeFromMenu}
							actionAdd={addRecipeToMenu}
						>
							<Icon name="xmark" />
							Remove from menu
						</RemoveMenuEntryButton>
					</li>
				</>
			)}
		</EntityActions>
	);
}
