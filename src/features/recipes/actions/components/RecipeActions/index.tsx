import { clsx } from "clsx";
import type { ComponentProps } from "react";
import { EntityActions } from "@/components/EntityActions";
import { ShareAction } from "@/components/ShareAction";
import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { CreateRecipeEntryDialog } from "@/features/lists/entries/components/CreateRecipeEntryDialog";
import { ConfirmDeleteRecipe } from "@/features/recipes/actions/components/ConfirmDeleteRecipe";
import { DuplicateRecipeButton } from "@/features/recipes/actions/components/DuplicateRecipeButton";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/actions/components/ToggleFavoriteRecipeButton";
import { deleteRecipe } from "@/features/recipes/api/deleteRecipe";
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
						<DuplicateRecipeButton
							{...actionProps}
							recipe={recipe}
							color="amber"
						>
							<Icon name="clone" size={1} /> Duplicate
						</DuplicateRecipeButton>
					</li>

					<li>
						<ConfirmDeleteRecipe
							buttonProps={actionProps}
							recipe={recipe}
							action={deleteRecipe.bind(null, {
								id: recipe.id,
								redirectTo: "/bar/recipes",
							})}
						>
							<Icon name="trash" size={1} /> Delete
						</ConfirmDeleteRecipe>
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
