import { getRecipeUrl } from "@bespoke/domain/recipes/getRecipeUrl";
import { getKey } from "@bespoke/domain/utils/withKey";
import { AppError } from "@bespoke/schema/appError";
import {
	MAX_LINES_PER_RECIPE,
	type RecipeFormData,
	recipeFormSchema,
} from "@bespoke/schema/schema/composite";
import type { BaseRecipe, Recipe } from "@bespoke/schema/schema/recipes";
import type { Keyed } from "@bespoke/schema/types";
import { LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { RecipeName } from "@bespoke/ui/RecipeName";
import { Text } from "@bespoke/ui/Text";
import { ToastActions, toast } from "@bespoke/ui/Toast";
import { use, useCallback } from "react";
import z from "zod";
import { showRecipeLimitReachedToast } from "@/features/billing/components/RecipeLimitReachedToast";
import { RecipeSlotUsageContext } from "@/features/billing/components/RecipeSlotUsageProvider";
import { createPromiseToast } from "@/utils/createPromiseToast";

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

	return useCallback(async () => {
		const toastId = Date.now().toString();

		if (usage && usage.remaining < recipes.length) {
			showRecipeLimitReachedToast(usage, { id: toastId });
			onError?.();
			return;
		}

		const promise = (async () => {
			const overLimit = recipes.find(
				(recipe) => (recipe.lines?.length ?? 0) > MAX_LINES_PER_RECIPE,
			);
			if (overLimit) {
				throw new AppError({
					code: "RECIPE_LINE_LIMIT_REACHED",
					limit: MAX_LINES_PER_RECIPE,
					recipeName: overLimit.name,
				});
			}

			const data = z.array(recipeFormSchema).parse(
				recipes.map(({ lines, ...recipe }) => ({
					recipe,
					lines,
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

		await createPromiseToast(promise, {
			toastId,
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
							href={createMoreHref ?? "/recipes"}
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
			error: {
				message: "Recipe could not be created",
				description: "Try again later.",
			},
		});
	}, [recipes, createRecipes, onSuccess, onError, createMoreHref, usage]);
}
