import { use, useCallback } from "react";
import z from "zod";
import { type RecipeFormData, recipeFormSchema } from "@/db/schema/composite";
import type { BaseRecipe, Recipe } from "@/db/schema/recipes";
import { showRecipeLimitReachedToast } from "@/features/billing/components/RecipeLimitReachedToast";
import { RecipeSlotUsageContext } from "@/features/billing/components/RecipeSlotUsageProvider";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { getRecipeUrl } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { ToastActions, toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";
import { getKey, type Keyed } from "@/utils/withKey";

export function useCreateBulkDraftRecipes(
	recipes: Keyed<BaseRecipe>[],
	createRecipes: (recipes: RecipeFormData[]) => Promise<Recipe[]>,
	{
		onSuccess,
		onError,
		createMoreHref,
	}: {
		onSuccess?: (recipes: Recipe[]) => void;
		onError?: (error?: unknown) => void;
		createMoreHref?: string;
	} = {},
) {
	const usage = use(RecipeSlotUsageContext);

	return useCallback(() => {
		const toastId = Date.now().toString();

		if (usage && usage.remaining < recipes.length) {
			showRecipeLimitReachedToast(usage, { id: toastId });
			onError?.();
			return;
		}

		const promise = (async () => {
			const data = z.array(recipeFormSchema).parse(
				recipes.map(({ specs, ...recipe }) => ({
					recipe,
					specs,
				})),
			);
			return createRecipes(data);
		})()
			.then((recipes) => {
				onSuccess?.(recipes);
				return recipes;
			})
			.catch((error) => {
				onError?.(error);
				throw error;
			});

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
							href={createMoreHref ?? "/bar/recipes"}
							variant="ghost"
							color="heavy"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							{createMoreHref ? "Create more Recipes" : "All recipes"}
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
			error: (error) => ({
				message: "Recipe could not be created",
				description: errorMessageOrFallback(error, "Try again later."),
			}),
		});
	}, [recipes, createRecipes, onSuccess, onError, createMoreHref, usage]);
}
