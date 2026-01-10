"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { toggleRecipeFavorite } from "@/features/recipes/actions/toggleRecipeFavorite";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function ToggleFavoriteRecipeButton({
	recipe,
	children,
	isFavorite,
	externalToastId,
	...buttonProps
}: {
	recipe: RecipeWithSpecs;
	isFavorite: boolean;
	externalToastId?: string;
} & ButtonProps) {
	const { action: actionToggleFavoriteRecipe } =
		useServerAction(toggleRecipeFavorite);

	const handleToggleFavorite = async () => {
		const promise = actionToggleFavoriteRecipe(recipe.id);

		const toastId = externalToastId ?? Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: isFavorite ? "Removing…" : "Adding…",
			success: () => ({
				message: isFavorite
					? `Removed "${recipe.name}" from favorites`
					: `Added "${recipe.name}" to favorites`,
				action: (
					<ToastActions>
						<ToggleFavoriteRecipeButton
							recipe={recipe}
							variant="ghost"
							size="tiny"
							key="toggle-favorite"
							isFavorite={!isFavorite}
							externalToastId={toastId}
						>
							<Icon name="arrow-rotate-left" size={0} />
							Undo
						</ToggleFavoriteRecipeButton>

						{!isFavorite ? (
							<LinkButton
								size="tiny"
								href="/bar/recipes/favorites"
								variant="ghost"
								color="heavy"
								prefetch={false}
								onClick={() => toast.dismiss(toastId)}
							>
								View favorites
							</LinkButton>
						) : null}
					</ToastActions>
				),
			}),
			error: (e) => ({
				message: "Could not toggle favorite Recipe",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
		});
	};

	return (
		<form action={handleToggleFavorite}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
