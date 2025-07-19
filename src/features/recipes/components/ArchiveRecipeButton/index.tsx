"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { UnarchiveRecipeButton } from "@/features/recipes/components/UnarchiveRecipeButton";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function ArchiveRecipeButton({
	recipe,
	actionArchive,
	actionUnarchive,
	children,
	...buttonProps
}: {
	recipe: RecipeWithSpecs;
	actionArchive: (args: { id: string }) => Promise<void>;
	actionUnarchive: (args: { id: string }) => Promise<void>;
} & ButtonProps) {
	const { action: archiveRecipe } = useServerAction(actionArchive);

	const handleArchive = async () => {
		const promise = archiveRecipe({
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
							actionUnarchive={actionUnarchive}
							actionArchive={actionArchive}
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
			error: () => "Could not archive recipe. Please try again later.",
		});
	};

	return (
		<form action={handleArchive}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
