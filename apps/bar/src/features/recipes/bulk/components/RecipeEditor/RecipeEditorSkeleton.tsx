import { Flex } from "@bespoke/ui/Flex";
import { Icon } from "@bespoke/ui/Icon";
import { Skeleton } from "@bespoke/ui/Skeleton";
import { Text } from "@bespoke/ui/Text";
import { BulkDraftInfo } from "@/features/recipes/bulk/components/BulkDraftInfo";
import styles from "./styles.module.css";

export function RecipeEditorSkeleton() {
	return (
		<div className={styles.root}>
			<Flex
				gap={2}
				alignItems="center"
				justifyContent="space-between"
				className={styles.titleBar}
			>
				<Flex gap={2} alignItems="center">
					<Icon
						name="duotone-input-text"
						size={3}
						className={styles.titleIcon}
					/>

					<Text size={1} weight={600}>
						Text editor
					</Text>
				</Flex>

				<BulkDraftInfo />
			</Flex>

			<div className={styles.skeleton} />

			<div className={styles.skeletonActions}>
				<Flex gap={2} alignItems="center">
					<Skeleton variant="block" width="100px" height="var(--space-5)" />
					<Skeleton variant="block" width="50px" height="var(--space-5)" />
					<Skeleton variant="block" width="60px" height="var(--space-5)" />
				</Flex>
			</div>

			<div className={styles.statusBar}>
				<Text as="div" size={0}>
					<Skeleton variant="text" width="160px" height="var(--space-2)" />
				</Text>
			</div>
		</div>
	);
}
