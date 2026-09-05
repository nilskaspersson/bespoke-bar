"use client";

import { getRecipeName } from "@bespoke/domain/recipes/labels";
import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { EntityActions } from "@bespoke/ui/EntityActions";
import { Icon } from "@bespoke/ui/Icon";
import { RecipeName } from "@bespoke/ui/RecipeName";
import type { ComponentProps } from "react";
import { CreateMenuEntryButton } from "@/features/menus/entries/components/CreateMenuEntryButton";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { RecipeActionsToggle } from "@/features/recipes/actions/components/RecipeActionsToggle";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/actions/components/ToggleFavoriteRecipeButton";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithRelations;
	isFavorite?: boolean;
	onDelete?: () => void;
	onToggleFavorite?: (isFavorite: boolean) => void;
} & Omit<ComponentProps<typeof EntityActions>, "children">;

export function RecipeCardActions({
	recipe,
	isFavorite = false,
	onDelete,
	onToggleFavorite,
	...props
}: Props) {
	return (
		<EntityActions justifyContent="flex-end" {...props}>
			{(actionProps) => (
				<>
					<li className={styles.item}>
						<CreateMenuEntryButton {...actionProps} recipe={recipe}>
							<Icon name="plus" size={1} /> Add to Menu
						</CreateMenuEntryButton>
					</li>

					<li className={styles.item}>
						<ToggleFavoriteRecipeButton
							{...actionProps}
							recipe={recipe}
							isFavorite={isFavorite}
							onToggleFavorite={onToggleFavorite}
						>
							Favorite
						</ToggleFavoriteRecipeButton>
					</li>

					<li className={styles.item}>
						<RecipeActionsToggle
							heading={<RecipeName recipe={recipe} />}
							label={`Actions for ${getRecipeName(recipe)}`}
						>
							<RecipeActions
								recipe={recipe}
								isFavorite={isFavorite}
								onDelete={onDelete}
								onToggleFavorite={onToggleFavorite}
							/>
						</RecipeActionsToggle>
					</li>
				</>
			)}
		</EntityActions>
	);
}
