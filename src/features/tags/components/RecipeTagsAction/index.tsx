"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { createTag } from "@/features/tags/api/createTag";
import { setRecipeTags } from "@/features/tags/api/setRecipeTags";
import { RecipeTagsCombobox } from "@/features/tags/components/RecipeTagsCombobox";
import { RecipeTagsPopoverContent } from "@/features/tags/components/RecipeTagsPopoverContent";
import { usePopover } from "@/hooks/usePopover";
import { Button, type ButtonProps } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Popover } from "@/ui/Popover";
import { Text } from "@/ui/Text";
import { toast } from "@/ui/Toast";
import { errorMessageOrFallback } from "@/utils/api";
import styles from "./styles.module.css";

type Props = {
	recipe: RecipeWithRelations;
	tagOptions: Tag[];
} & ButtonProps;

export function RecipeTagsAction({
	recipe,
	tagOptions,
	...buttonProps
}: Props) {
	const popover = usePopover({ type: "auto" });
	const comboboxPopover = usePopover({ type: "auto" });

	const [, startTransition] = useTransition();
	const initialAssignedIds = recipe.tags.map((rt) => rt.tag.id);
	const [optimisticAssignedIds, dispatch] = useOptimistic<string[], string[]>(
		initialAssignedIds,
		(_, next) => next,
	);

	/**
	 * Tags created during this session that haven't yet been picked up by
	 * the server-rendered tagOptions cache. Stored as plain state so the
	 * combobox can list them in suggestions immediately, before Next.js
	 * revalidation propagates them into tagOptions.
	 */
	const [createdTags, setCreatedTags] = useState<Tag[]>([]);

	const allTagOptions = useMemo(() => {
		const map = new Map<string, Tag>();
		for (const t of tagOptions) map.set(t.id, t);
		for (const t of createdTags) map.set(t.id, t);
		return Array.from(map.values());
	}, [tagOptions, createdTags]);

	const tagsById = useMemo(() => {
		const map = new Map<string, Tag>();
		for (const t of allTagOptions) map.set(t.id, t);
		for (const rt of recipe.tags) map.set(rt.tag.id, rt.tag);
		return map;
	}, [allTagOptions, recipe.tags]);

	const handleRemove = (tagId: string) => {
		startTransition(async () => {
			const next = optimisticAssignedIds.filter((id) => id !== tagId);
			dispatch(next);
			try {
				await setRecipeTags(recipe.id, next);
			} catch (e) {
				toast.error("Could not remove tag", {
					description: errorMessageOrFallback(e, "Try again later."),
				});
			}
		});
	};

	const handleCreateTag = async (name: string): Promise<Tag> => {
		try {
			const tag = await createTag({ name });
			setCreatedTags((prev) => [...prev, tag]);
			return tag;
		} catch (e) {
			toast.error("Could not create tag", {
				description: errorMessageOrFallback(e, "Try again later."),
			});
			throw e;
		}
	};

	const handleCommit = (nextAssignedIds: string[]) => {
		const sameLength = nextAssignedIds.length === optimisticAssignedIds.length;
		const sameContent =
			sameLength &&
			nextAssignedIds.every((id) => optimisticAssignedIds.includes(id));
		if (sameContent) return;

		startTransition(async () => {
			dispatch(nextAssignedIds);
			try {
				await setRecipeTags(recipe.id, nextAssignedIds);
			} catch (e) {
				toast.error("Could not update tags", {
					description: errorMessageOrFallback(e, "Try again later."),
				});
			}
		});
	};

	const tagCount = optimisticAssignedIds.length;

	return (
		<>
			<Button
				variant="action"
				{...buttonProps}
				{...popover.triggerProps}
				aria-label="Tags"
				className={styles.trigger}
			>
				<Icon name="tags" size={1} />

				<span>
					Tags{" "}
					{tagCount > 0 ? (
						<Text as="span" size={0} numeric>
							({tagCount})
						</Text>
					) : null}
				</span>
			</Button>

			<Popover
				{...popover.contentProps}
				position="bottom-start"
				className={styles.popover}
			>
				<RecipeTagsPopoverContent
					assignedTagIds={optimisticAssignedIds}
					tagsById={tagsById}
					onRemove={handleRemove}
					onClose={popover.closePopover}
				>
					<Flex justifyContent="flex-end">
						<Button
							{...comboboxPopover.triggerProps}
							variant="outline"
							color="accent"
							size="tiny"
						>
							<Icon name="plus" />
							Add tags
						</Button>
					</Flex>
				</RecipeTagsPopoverContent>

				<RecipeTagsCombobox
					popoverContentProps={comboboxPopover.contentProps}
					onClosePopover={comboboxPopover.closePopover}
					tagOptions={allTagOptions}
					assignedTagIds={optimisticAssignedIds}
					onCreateTag={handleCreateTag}
					onCommit={handleCommit}
				/>
			</Popover>
		</>
	);
}
