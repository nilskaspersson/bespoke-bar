"use client";

import { useMemo, useOptimistic, useTransition } from "react";

import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { createTag } from "@/features/tags/api/createTag";
import { setRecipeTags } from "@/features/tags/api/setRecipeTags";
import { RecipeTagsCombobox } from "@/features/tags/components/RecipeTagsCombobox";
import { RecipeTagsPopoverContent } from "@/features/tags/components/RecipeTagsPopoverContent";
import { usePopover } from "@/hooks/usePopover";
import { Button, type ButtonProps } from "@/ui/Button";
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
	 * Bridge for newly-created tags so the combobox can list them in
	 * suggestions immediately, before Next.js revalidation propagates them
	 * into the server-rendered tagOptions prop.
	 */
	const [optimisticTagOptions, addOptimisticTag] = useOptimistic<Tag[], Tag>(
		tagOptions,
		(current, tag) => [...current, tag],
	);

	const tagsById = useMemo(() => {
		const map = new Map<string, Tag>();
		for (const t of optimisticTagOptions) map.set(t.id, t);
		return map;
	}, [optimisticTagOptions]);

	const handleCreateTag = async (name: string): Promise<Tag> => {
		try {
			const tag = await createTag({ name });
			startTransition(() => addOptimisticTag(tag));
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
					onClose={popover.closePopover}
				>
					<Flex justifyContent="flex-end">
						<Button
							{...comboboxPopover.triggerProps}
							variant="action"
							color="accent"
							size="tiny"
						>
							<Icon name="tags" />
							Manage tags
						</Button>
					</Flex>
				</RecipeTagsPopoverContent>

				<RecipeTagsCombobox
					popoverContentProps={comboboxPopover.contentProps}
					onClosePopover={comboboxPopover.closePopover}
					tagOptions={optimisticTagOptions}
					assignedTagIds={optimisticAssignedIds}
					onCreateTag={handleCreateTag}
					onCommit={handleCommit}
				/>
			</Popover>
		</>
	);
}
