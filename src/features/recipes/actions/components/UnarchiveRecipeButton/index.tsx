"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { ArchiveRecipeButton } from "@/features/recipes/actions/components/ArchiveRecipeButton";
import { unarchiveRecipe } from "@/features/recipes/api/archiveRecipe";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";

export function UnarchiveRecipeButton({
	recipe,
	children,
	...buttonProps
}: {
	recipe: RecipeWithSpecs;
} & ButtonProps) {
	const { action: actionUnarchiveRecipe } = useServerAction(unarchiveRecipe);

	const handleUnarchive = async () => {
		const promise = actionUnarchiveRecipe({
			id: recipe.id,
		});

		const toastId = Date.now().toString();

		toast.promise(promise, {
			id: toastId,
			loading: "Restoring…",
			success: () => ({
				message: "Recipe restored",
				action: (
					<ToastActions>
						<ArchiveRecipeButton
							recipe={recipe}
							variant="ghost"
							color="red"
							size="tiny"
							key="undo-unarchive"
							onClick={() => toast.dismiss(toastId)}
						>
							Undo
						</ArchiveRecipeButton>

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
				message: "Could not restore Recipe",
				description: errorMessageOrFallback(e, "Try again later."),
			}),
		});
	};

	return (
		<form action={handleUnarchive}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
