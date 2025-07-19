"use client";

import type { RecipeWithSpecs } from "@/db/schema/recipes";
import { useServerAction } from "@/hooks/useServerAction";
import { type ButtonProps, LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { ToastActions, toast } from "@/ui/Toast";

export function UnarchiveRecipeButton({
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
	const { action: unarchiveRecipe } = useServerAction(action);

	const handleUnarchive = async () => {
		const promise = unarchiveRecipe({
			id: recipe.id,
		});

		toast(promise, {
			loading: "Restoring…",
			success: () => ({
				message: "Recipe restored",
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
			error: "Error unarchiving recipe",
		});
	};

	return (
		<form action={handleUnarchive}>
			<SubmitButton {...buttonProps}>{children}</SubmitButton>
		</form>
	);
}
