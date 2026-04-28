"use client";

import { ShareAction } from "@/components/ShareAction";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import { CreateListEntryButton } from "@/features/lists/entries/components/CreateListEntryButton";
import { DeleteRecipeButton } from "@/features/recipes/actions/components/DeleteRecipeButton";
import { DuplicateRecipeButton } from "@/features/recipes/actions/components/DuplicateRecipeButton";
import { ToggleFavoriteRecipeButton } from "@/features/recipes/actions/components/ToggleFavoriteRecipeButton";
import { getRecipeUrl } from "@/features/recipes/utils";
import { CopySpecsToClipboard } from "@/features/specs/components/CopySpecsToClipboard";
import { LinkButton } from "@/ui/Button";
import { useContextMenu } from "@/ui/ContextMenu";
import { Icon } from "@/ui/Icon";
import { handleKey } from "@/utils/keyboard";
import { getServerSideBaseURL } from "@/utils/url";
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
	const dismissProps = {
		onClick: close,
		onKeyDown: handleKey([
			["Enter", close],
			[" ", close],
		]),
	} as const;

	return (
		<menu className={styles.menu} aria-label="Recipe actions">
			<li {...dismissProps}>
				<LinkButton
					{...baseActionProps}
					href={getRecipeUrl(recipe)}
					color="accent"
				>
					<Icon name="arrow-right" size={1} />
					View
				</LinkButton>
			</li>

			<li {...dismissProps}>
				<ToggleFavoriteRecipeButton
					{...baseActionProps}
					recipe={recipe}
					isFavorite={isFavorite ?? false}
					onToggleFavorite={onToggleFavorite}
				>
					Favorite
				</ToggleFavoriteRecipeButton>
			</li>

			<li {...dismissProps}>
				<LinkButton
					{...baseActionProps}
					href={`/bar/recipes/${recipe.id}/edit`}
					prefetch={false}
					color="accent"
				>
					<Icon name="pen-to-square" size={1} />
					Edit
				</LinkButton>
			</li>

			<li {...dismissProps}>
				<CreateListEntryButton {...baseActionProps} recipe={recipe}>
					<Icon name="plus" size={1} /> Add to list
				</CreateListEntryButton>
			</li>

			<li {...dismissProps}>
				<CopySpecsToClipboard
					{...baseActionProps}
					specs={recipe.specs}
					iconSize={1}
				>
					Copy specs
				</CopySpecsToClipboard>
			</li>

			<li {...dismissProps}>
				<DuplicateRecipeButton
					{...baseActionProps}
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

			<li {...dismissProps}>
				<ShareAction
					{...baseActionProps}
					value={new URL(
						getRecipeUrl(recipe),
						getServerSideBaseURL(),
					).toString()}
				>
					Share link
				</ShareAction>
			</li>
		</menu>
	);
}
