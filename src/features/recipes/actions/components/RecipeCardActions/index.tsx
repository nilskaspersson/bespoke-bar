"use client";

import type { ComponentProps } from "react";
import { EntityActions } from "@/components/EntityActions";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateListEntryButton } from "@/features/lists/entries/components/CreateListEntryButton";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { RecipeActionsToggle } from "@/features/recipes/actions/components/RecipeActionsToggle";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/actions/components/ToggleFavoriteRecipeButton";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { getRecipeName, getRecipeUrl } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";

type Props = {
	recipe: RecipeWithSpecs;
	isFavorite?: boolean;
	withLink?: boolean;
	onDelete?: () => void;
} & Omit<ComponentProps<typeof EntityActions>, "children">;

export function RecipeCardActions({
	recipe,
	isFavorite = false,
	withLink,
	onDelete,
	...props
}: Props) {
	return (
		<EntityActions justifyContent="flex-end" {...props}>
			{(actionProps) => (
				<>
					{withLink ? (
						<li>
							<LinkButton
								{...actionProps}
								href={getRecipeUrl(recipe)}
								color="accent"
							>
								<Icon name="arrow-right" size={1} />
								View
							</LinkButton>
						</li>
					) : null}

					<li>
						<ToggleFavoriteRecipeButton
							{...actionProps}
							recipe={recipe}
							isFavorite={isFavorite}
						>
							Favorite
						</ToggleFavoriteRecipeButton>
					</li>

					<li>
						<CreateListEntryButton {...actionProps} recipe={recipe}>
							<Icon name="plus" size={1} /> Add to list
						</CreateListEntryButton>
					</li>

					<li>
						<RecipeActionsToggle
							heading={<RecipeName recipe={recipe} />}
							label={`Actions for ${getRecipeName(recipe)}`}
						>
							<RecipeActions
								recipe={recipe}
								withLink={withLink}
								isFavorite={isFavorite}
								onDelete={onDelete}
							/>
						</RecipeActionsToggle>
					</li>
				</>
			)}
		</EntityActions>
	);
}
