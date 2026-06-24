"use client";

import type { MenuEntryWithRecipe } from "@bespoke/schema/schema/menuEntries";
import { LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { EntityActions } from "@/components/EntityActions";
import { RemoveMenuEntryButton } from "@/features/menus/actions/components/RemoveMenuEntryButton";
import { addRecipeToMenu } from "@/features/menus/entries/api/addRecipeToMenu";
import { removeRecipeFromMenu } from "@/features/menus/entries/api/removeRecipeFromMenu";
import { UpdateEntryDialog } from "@/features/menus/entries/components/UpdateEntryDialog";

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
							href={`/recipes/${entry.recipe.id}/edit`}
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
