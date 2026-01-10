import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { EntityActions } from "@/app/components/EntityActions";
import { ShareAction } from "@/app/components/ShareAction";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateRecipeEntryDialog } from "@/features/lists/components/CreateRecipeEntryDialog";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { DeleteRecipe } from "@/features/recipes/components/DeleteRecipe";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/components/ToggleFavoriteRecipeButton";
import { getRecipeUrl } from "@/features/recipes/utils";
import { CopySpecsToClipboard } from "@/features/specs/components/CopySpecsToClipboard";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { ToggleModalButton } from "@/ui/ToggleModalButton";
import { getServerSideBaseURL } from "@/utils/url";

import styles from "./styles.module.css";

export function RecipeActions({
	recipe,
	withLink,
	isFavorite,
	...props
}: {
	recipe: RecipeWithSpecs;
	withLink?: boolean;
	isFavorite?: boolean;
} & Omit<ComponentProps<typeof EntityActions>, "children">) {
	return (
		<EntityActions {...props}>
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
							isFavorite={isFavorite ?? false}
							color={isFavorite ? "red" : actionProps.color}
							className={clsx(actionProps.className, {
								[styles.favorite]: isFavorite,
							})}
						>
							<Icon name={isFavorite ? "heart-solid" : "heart"} size={1} />
							Favorite
						</ToggleFavoriteRecipeButton>
					</li>

					<li>
						<LinkButton
							{...actionProps}
							href={`/bar/recipes/${recipe.id}/edit`}
							prefetch={false}
							color="accent"
						>
							<Icon name="pen-to-square" size={1} />
							Edit
						</LinkButton>
					</li>

					<li>
						<ToggleModalButton
							{...actionProps}
							label={
								<>
									<Icon name="plus" size={1} /> Add to list
								</>
							}
						>
							<CreateRecipeEntryDialog recipe={recipe} />
						</ToggleModalButton>
					</li>

					<li>
						<CopySpecsToClipboard
							{...actionProps}
							specs={recipe.specs}
							iconSize={1}
						>
							Copy specs
						</CopySpecsToClipboard>
					</li>

					<li>
						<DeleteRecipe
							buttonProps={actionProps}
							recipe={recipe}
							action={deleteRecipe.bind(null, {
								id: recipe.id,
								redirectTo: "/bar/recipes",
							})}
						>
							<Icon name="trash" size={1} /> Delete
						</DeleteRecipe>
					</li>

					<li>
						<ShareAction
							{...actionProps}
							value={new URL(
								getRecipeUrl(recipe),
								getServerSideBaseURL(),
							).toString()}
						>
							Share link
						</ShareAction>
					</li>
				</>
			)}
		</EntityActions>
	);
}
