"use client";

import type { ComponentProps } from "react";
import { EntityActions } from "@/components/EntityActions";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateListEntryButton } from "@/features/lists/entries/components/CreateListEntryButton";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { RecipeActionsToggle } from "@/features/recipes/actions/components/RecipeActionsToggle";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/actions/components/ToggleFavoriteRecipeButton";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { getRecipeName } from "@/features/recipes/utils";
import { Icon } from "@/ui/Icon";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithSpecs;
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
						<CreateListEntryButton {...actionProps} recipe={recipe}>
							<Icon name="plus" size={1} /> Add to list
						</CreateListEntryButton>
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
