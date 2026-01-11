"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { UnarchiveRecipeButton } from "@/features/recipes/actions/components/UnarchiveRecipeButton";
import { archiveRecipe } from "@/features/recipes/api/archiveRecipe";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function ArchiveRecipeButton({
	recipe,
	children,
	...buttonProps
}: {
	recipe: RecipeWithSpecs;
} & ButtonProps) {
	const { action: actionAchiveRecipe } = useServerAction(archiveRecipe);

	const handleArchive = async () => {
		const promise = actionAchiveRecipe({
			id: recipe.id,
		});

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Archiving…",
			success: () => ({
				message: "Recipe archived",
				description: "Archived Recipes can be found in the archive.",
				action: (
					<ToastActions>
						<UnarchiveRecipeButton
							recipe={recipe}
							variant="ghost"
							color="red"
							size="tiny"
							key="undo-archive"
							onClick={() => toast.dismiss(toastId)}
						>
							Undo
						</UnarchiveRecipeButton>

						<LinkButton
							size="tiny"
							href="/bar/recipes/archive"
							variant="ghost"
							color="heavy"
							prefetch={false}
							onClick={() => toast.dismiss(toastId)}
						>
							View archive
							<Icon name="angles-right" size={0} />
						</LinkButton>
					</ToastActions>
				),
			}),
			error: (e) => ({
				message: "Could not archive Recipe",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
		});
	};

	return (
		<form action={handleArchive}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
