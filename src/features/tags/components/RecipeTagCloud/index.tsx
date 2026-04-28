"use client";

import type { ReactNode } from "react";
import type { Tag } from "@/db/schema/tags";
import { Button } from "@/ui/Button";
import { Chip } from "@/ui/Chip";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type Props = {
	assignedTagIds: string[];
	tagsById: Map<string, Tag>;
	onRemove: (tagId: string) => void;
	children?: ReactNode;
};

export function RecipeTagCloud({
	assignedTagIds,
	tagsById,
	onRemove,
	children,
}: Props) {
	return (
		<>
			{assignedTagIds.length === 0 ? (
				<Text as="p" size={2} light>
					No tags applied
				</Text>
			) : null}

			<Grid gap={1}>
				{assignedTagIds.length > 0 ? (
					<Flex
						as="ul"
						wrap
						gap={1}
						className={styles.cloud}
						aria-label="Applied tags"
					>
						{assignedTagIds.map((tagId) => {
							const tag = tagsById.get(tagId);

							if (!tag) {
								return null;
							}

							return (
								<li key={tagId}>
									<Chip variant="outline" size={1} className={styles.tag}>
										<Icon name="tag" size={0} />
										{tag.name}
										<Button
											variant="base"
											icon
											onClick={() => onRemove(tagId)}
											aria-label={`Remove tag ${tag.name}`}
											title="Remove tag"
											className={styles.remove}
										>
											<Icon name="xmark" size={0} />
										</Button>
									</Chip>
								</li>
							);
						})}
					</Flex>
				) : null}

				{children}
			</Grid>
		</>
	);
}
