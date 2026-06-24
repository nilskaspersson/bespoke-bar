import type { Tag } from "@bespoke/schema/schema/tags";
import { Button } from "@bespoke/ui/Button";
import { Flex } from "@bespoke/ui/Flex";
import { Heading } from "@bespoke/ui/Heading";
import { Icon } from "@bespoke/ui/Icon";
import { Lightbox } from "@bespoke/ui/Lightbox";
import type { ReactNode } from "react";
import { RecipeTagCloud } from "@/features/tags/components/RecipeTagCloud";
import styles from "./styles.module.css";

type Props = {
	assignedTagIds: string[];
	tagsById: Map<string, Tag>;
	onClose: () => void;
	children?: ReactNode;
};

export function RecipeTagsPopoverContent({
	assignedTagIds,
	tagsById,
	onClose,
	children,
}: Props) {
	const count = assignedTagIds.length;

	return (
		<Lightbox className={styles.surface}>
			<Flex justifyContent="space-between" alignItems="center" gap={2}>
				<Heading level="h4" size={3}>
					Tags {count > 0 ? `(${count})` : null}
				</Heading>

				<Button
					variant="ghost"
					size="tiny"
					icon
					onClick={onClose}
					aria-label="Close"
					title="Close"
				>
					<Icon name="xmark" />
				</Button>
			</Flex>

			<RecipeTagCloud
				assignedTagIds={assignedTagIds}
				tagsById={tagsById}
				withOverflow
			>
				{children}
			</RecipeTagCloud>
		</Lightbox>
	);
}
