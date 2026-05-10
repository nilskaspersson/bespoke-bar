"use client";

import { useMemo } from "react";
import type { RecipeWithRelations } from "@/db/schema/recipes";
import type { Tag } from "@/db/schema/tags";
import { RecipeTag } from "@/features/tags/components/RecipeTag";
import { RecipeTagsCombobox } from "@/features/tags/components/RecipeTagsCombobox";
import { usePopover } from "@/hooks/usePopover";
import { Button } from "@/ui/Button";
import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";

const TOP_TAG_COUNT = 5;

type Props = {
	recipes: RecipeWithRelations[];
	tagOptions: Tag[];
	selectedTagIds: string[];
	onSelectedTagIdsChange: (ids: string[]) => void;
};

export function RecipesTagFilters({
	recipes,
	tagOptions,
	selectedTagIds,
	onSelectedTagIdsChange,
}: Props) {
	const tagsPopover = usePopover({ type: "auto" });

	const topTags = useMemo(() => {
		const ranked = new Map<string, { tag: Tag; count: number }>();
		for (const recipe of recipes) {
			for (const { tag } of recipe.tags) {
				const existing = ranked.get(tag.id);
				ranked.set(tag.id, { tag, count: (existing?.count ?? 0) + 1 });
			}
		}
		return [...ranked.values()]
			.sort((a, b) => b.count - a.count)
			.slice(0, TOP_TAG_COUNT)
			.map((entry) => entry.tag);
	}, [recipes]);

	function toggleTag(tagId: string) {
		onSelectedTagIdsChange(
			selectedTagIds.includes(tagId)
				? selectedTagIds.filter((id) => id !== tagId)
				: [...selectedTagIds, tagId],
		);
	}

	const extraSelectedTagCount = selectedTagIds.filter(
		(id) => !topTags.some((t) => t.id === id),
	).length;

	return (
		<Flex gap={1} alignItems="center" wrap justifyContent="center">
			{topTags.map((tag) => (
				<RecipeTag
					key={tag.id}
					tag={tag}
					selected={selectedTagIds.includes(tag.id)}
					onClick={() => toggleTag(tag.id)}
				/>
			))}

			{tagOptions.length > topTags.length ? (
				<Button {...tagsPopover.triggerProps} variant="action" size="tiny">
					<Icon name="tags" size={1} />
					All tags
					{extraSelectedTagCount > 0 ? (
						<Text as="span" size={1} weight={600}>
							+{extraSelectedTagCount}
						</Text>
					) : null}
				</Button>
			) : null}

			<RecipeTagsCombobox
				popoverContentProps={tagsPopover.contentProps}
				onClosePopover={tagsPopover.closePopover}
				tagOptions={tagOptions}
				assignedTagIds={selectedTagIds}
				onCommit={onSelectedTagIdsChange}
			/>
		</Flex>
	);
}
