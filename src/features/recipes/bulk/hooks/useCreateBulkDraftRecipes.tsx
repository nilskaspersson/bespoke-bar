import { useCallback } from "react";
import z from "zod";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { getRecipeUrl } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";
import { getKey, type Keyed } from "@/utils/withKey";

export function useCreateBulkDraftRecipes(
	recipes: Keyed<BaseRecipe>[],
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>,
	onSuccess?: (recipes: Recipe[]) => void,
) {
	return useCallback(() => {
		const data = z.array(recipeFormSchema).parse(
			recipes.map(({ specs, ...recipe }) => ({
				recipe,
				specs,
			})),
		);

		const promise = createRecipes(data).then((recipes) => {
			onSuccess?.(recipes);
			return recipes;
		});

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Creating recipes…",
			success: (recipes) => ({
				message:
					recipes.length === 1
						? "Recipe created"
						: `${recipes.length} recipes created`,
				description:
					recipes.length === 1 ? (
						"Visit the recipe page to continue adding details."
					) : (
						<Text as="ul" list>
							{recipes.map((recipe) => (
								<li key={getKey(recipe)}>
									<LinkButton
										variant="text"
										size="tiny"
										color="accent"
										href={getRecipeUrl(recipe)}
										prefetch
										onClick={() => toast.dismiss(toastId)}
									>
										<RecipeName recipe={recipe} />
									</LinkButton>
								</li>
							))}
						</Text>
					),
				action: (
					<ToastActions>
						<LinkButton
							size="tiny"
							href="/bar/recipes"
							variant="ghost"
							color="heavy"
							prefetch={false}
						>
							All recipes
						</LinkButton>

						{recipes.length === 1 ? (
							<LinkButton
								size="tiny"
								href={getRecipeUrl(recipes[0])}
								variant="solid"
								color="accent"
								prefetch
								onClick={() => toast.dismiss(toastId)}
							>
								View recipe
								<Icon name="angles-right" size={0} />
							</LinkButton>
						) : null}
					</ToastActions>
				),
			}),
			error: () => "Recipe could not be created",
		});
	}, [recipes, createRecipes, onSuccess]);
}
