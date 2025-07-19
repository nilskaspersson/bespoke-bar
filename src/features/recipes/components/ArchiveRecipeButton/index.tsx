"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function ArchiveRecipeButton({
	recipe,
	action,
	toastActions,
	children,
	...buttonProps
}: {
	recipe: RecipeWithSpecs;
	action: (args: { id: string }) => Promise<void>;
	toastActions?: React.ReactNode;
} & ButtonProps) {
	const { action: archiveRecipe } = useServerAction(action);

	const handleArchive = async () => {
		const promise = archiveRecipe({
			id: recipe.id,
		});

		toast(promise, {
			loading: "Archiving…",
			success: () => ({
				message: "Recipe archived",
				description: "Archived Recipes can be found in the archive.",
				action: (
					<ToastActions>
						{toastActions}

						<LinkButton
							size="tiny"
							href="/bar/recipes/archive"
							variant="ghost"
							color="heavy"
							prefetch={false}
						>
							View archive
							<Icon name="angles-right" size={0} />
						</LinkButton>
					</ToastActions>
				),
			}),
			error: () => "Recipe could not be archived",
		});
	};

	return (
		<form action={handleArchive}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
