"use client";

import type { RecipeWithLines } from "@bespoke/schema/schema/recipes";
import { type ButtonProps, LinkButton } from "@bespoke/ui/Button";
import { Icon } from "@bespoke/ui/Icon";
import { SubmitButton } from "@bespoke/ui/SubmitButton";
import { ToastActions, toast } from "@bespoke/ui/Toast";
import { clsx } from "clsx";
import { useOptimistic } from "react";
import { toggleRecipeFavorite } from "@/features/recipes/api/toggleRecipeFavorite";
import { noop } from "@/utils";
import { getErrorToast, unwrapAction } from "@/utils/api";
import styles from "./styles.module.css";

export function ToggleFavoriteRecipeButton({
	recipe,
	children,
	isFavorite,
	externalToastId,
	color,
	className,
	isQuickAction = false,
	onToggleFavorite,
	...buttonProps
}: {
	recipe: RecipeWithLines;
	isFavorite: boolean;
	externalToastId?: string;
	isQuickAction?: boolean;
	onToggleFavorite?: (isFavorite: boolean) => void;
} & ButtonProps) {
	const [optimisticIsFavorite, setOptimisticIsFavorite] = useOptimistic(
		isFavorite,
		(_, newValue: boolean) => newValue,
	);

	const handleToggleFavorite = async () => {
		const newFavoriteState = !optimisticIsFavorite;
		setOptimisticIsFavorite(newFavoriteState);
		onToggleFavorite?.(newFavoriteState);

		const toastId = externalToastId ?? Date.now().toString();

		const promise = unwrapAction(toggleRecipeFavorite(recipe.id));

		toast.promise(promise, {
			id: toastId,
			loading: newFavoriteState ? "Adding…" : "Removing…",
			success: () => ({
				message: newFavoriteState
					? `Added "${recipe.name}" to favorites`
					: `Removed "${recipe.name}" from favorites`,
				action: (
					<ToastActions>
						<ToggleFavoriteRecipeButton
							recipe={recipe}
							variant="ghost"
							size="tiny"
							key="toggle-favorite"
							isFavorite={newFavoriteState}
							externalToastId={toastId}
							isQuickAction
							onToggleFavorite={onToggleFavorite}
						>
							<Icon name="arrow-rotate-left" size={0} />
							Undo
						</ToggleFavoriteRecipeButton>

						{newFavoriteState ? (
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
			error: (e) =>
				getErrorToast(e, {
					message: "Could not toggle favorite Recipe",
					description: "Try again later.",
				}),
		});

		await promise.catch(noop);
	};

	return (
		<form action={handleToggleFavorite}>
			<SubmitButton
				{...buttonProps}
				color={optimisticIsFavorite ? "red" : color}
				className={clsx(className, {
					[styles.favorite]: optimisticIsFavorite && !isQuickAction,
				})}
			>
				{!isQuickAction ? (
					<Icon
						name={optimisticIsFavorite ? "heart-solid" : "heart"}
						size={1}
					/>
				) : null}
				{children}
			</SubmitButton>
		</form>
	);
}
