"use client";

import { type ReactNode, useMemo } from "react";
import type { Tag } from "@/db/schema/tags";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { collator } from "@/utils/collator";
import styles from "./styles.module.css";

type Props = {
	assignedTagIds: string[];
	tagsById: Map<string, Tag>;
	children?: ReactNode;
};

export function RecipeTagCloud({ assignedTagIds, tagsById, children }: Props) {
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
					No tags applied
				</Text>
			) : null}

			<Grid gap={1}>
				{sortedTags.length > 0 ? (
					<Flex
						as="ul"
						wrap
						gap={1}
						className={styles.cloud}
						aria-label="Applied tags"
					>
						{sortedTags.map((tag) => (
							<li key={tag.id}>
								<Chip variant="outline" size={1} className={styles.tag}>
									<Icon name="tag" size={0} />
									{tag.name}
								</Chip>
							</li>
						))}
					</Flex>
				) : null}

				{children}
			</Grid>
		</>
	);
}
