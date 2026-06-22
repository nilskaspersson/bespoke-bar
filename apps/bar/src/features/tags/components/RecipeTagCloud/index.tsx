"use client";

import { collator } from "@bespoke/domain/utils/collator";
import type { Tag } from "@bespoke/schema/schema/tags";
import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { Text } from "@bespoke/ui/Text";
import { clsx } from "clsx";
import { type ReactNode, useMemo } from "react";
import { RecipeTag } from "@/features/tags/components/RecipeTag";
import styles from "./styles.module.css";

type Props = {
	assignedTagIds: string[];
	tagsById: Map<string, Tag>;
	withOverflow?: boolean;
	selectedTagIds?: string[];
	onToggleTag?: (tagId: string) => void;
	label?: string;
	emptyLabel?: string;
	children?: ReactNode;
};

export function RecipeTagCloud({
	assignedTagIds,
	tagsById,
	withOverflow,
	selectedTagIds,
	onToggleTag,
	label = "Applied tags",
	emptyLabel = "No tags applied",
	children,
}: Props) {
	const sortedTags = useMemo(
		() =>
			assignedTagIds
				.map((id) => tagsById.get(id))
				.filter((tag): tag is Tag => tag !== undefined)
				.toSorted((a, b) => collator.compare(a.name, b.name)),
		[assignedTagIds, tagsById],
	);

	return (
		<>
			{sortedTags.length === 0 ? (
				<Text as="p" size={2} light>
					{emptyLabel}
				</Text>
			) : null}

			<Grid gap={2}>
				{sortedTags.length > 0 ? (
					<Flex
						as="ul"
						wrap
						gap={2}
						className={clsx({ [styles.cloud]: withOverflow })}
						aria-label={label}
					>
						{sortedTags.map((tag) => (
							<li key={tag.id}>
								<RecipeTag
									tag={tag}
									selected={selectedTagIds?.includes(tag.id)}
									onClick={onToggleTag ? () => onToggleTag(tag.id) : undefined}
								/>
							</li>
						))}
					</Flex>
				) : null}

				{children}
			</Grid>
		</>
	);
}
