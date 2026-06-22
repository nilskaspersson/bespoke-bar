"use client";

import type { RecipeWithRelations } from "@bespoke/schema/schema/recipes";
import { LinkButton } from "@bespoke/ui/Button";
import { useContextMenu } from "@bespoke/ui/ContextMenu";
import { Icon } from "@bespoke/ui/Icon";
import { ShareAction } from "@/components/ShareAction";
import { CopyLinesToClipboard } from "@/features/ingredientLines/components/CopyLinesToClipboard";
import { CreateMenuEntryButton } from "@/features/menus/entries/components/CreateMenuEntryButton";
import { DeleteRecipeButton } from "@/features/recipes/actions/components/DeleteRecipeButton";
import { DuplicateRecipeButton } from "@/features/recipes/actions/components/DuplicateRecipeButton";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/actions/components/ToggleFavoriteRecipeButton";
import { getRecipeUrl } from "@/features/recipes/utils";
import styles from "./styles.module.css";

const baseActionProps = {
	variant: "ghost",
	size: "small",
	color: "light",
	fullWidth: true,
	className: styles.item,
} as const;

export function RecipeActions({
	recipe,
	isFavorite,
	onDelete,
	onToggleFavorite,
}: {
	recipe: RecipeWithRelations;
	isFavorite?: boolean;
	onDelete?: () => void;
	onToggleFavorite?: (isFavorite: boolean) => void;
}) {
	const { closePopover: close } = useContextMenu();

	return (
		<menu className={styles.menu} aria-label="Recipe actions">
			<li>
				<LinkButton
					{...baseActionProps}
					onClick={close}
					href={getRecipeUrl(recipe)}
					color="accent"
				>
					<Icon name="arrow-right" size={1} />
					View
				</LinkButton>
			</li>

			<li>
				<ToggleFavoriteRecipeButton
					{...baseActionProps}
					onClick={close}
					recipe={recipe}
					isFavorite={isFavorite ?? false}
					onToggleFavorite={onToggleFavorite}
				>
					Favorite
				</ToggleFavoriteRecipeButton>
			</li>

			<li>
				<LinkButton
					{...baseActionProps}
					onClick={close}
					href={`/bar/recipes/${recipe.id}/edit`}
					prefetch={false}
					color="accent"
				>
					<Icon name="pen-to-square" size={1} />
					Edit
				</LinkButton>
			</li>

			<li>
				<CreateMenuEntryButton
					{...baseActionProps}
					recipe={recipe}
					onClick={close}
				>
					<Icon name="plus" size={1} /> Add to Menu
				</CreateMenuEntryButton>
			</li>

			<li>
				<CopyLinesToClipboard
					{...baseActionProps}
					onClick={close}
					lines={recipe.lines}
					iconSize={1}
				>
					Copy spec
				</CopyLinesToClipboard>
			</li>

			<li>
				<DuplicateRecipeButton
					{...baseActionProps}
					onClick={close}
					recipe={recipe}
					color="amber"
				>
					<Icon name="clone" size={1} /> Duplicate
				</DuplicateRecipeButton>
			</li>

			<li>
				<DeleteRecipeButton
					buttonProps={baseActionProps}
					recipe={recipe}
					confirm
					onDelete={onDelete}
				>
					<Icon name="trash" size={1} /> Delete
				</DeleteRecipeButton>
			</li>

			<li>
				<ShareAction
					{...baseActionProps}
					onClick={close}
					value={getRecipeUrl(recipe)}
				>
					Share link
				</ShareAction>
			</li>
		</menu>
	);
}
