import { Flex } from "@/ui/Flex";
import { Icon } from "@/ui/Icon";
import { Skeleton } from "@/ui/Skeleton";
import { Text } from "@/ui/Text";
import styles from "./RecipeEditor.module.css";

export function RecipeEditorSkeleton() {
	return (
		<div className={styles.root}>
			<Flex gap={2} alignItems="center" className={styles.titleBar}>
				<Icon name="duotone-input-text" size={3} className={styles.titleIcon} />

				<Text size={1} weight={600}>
					Recipe editor
				</Text>
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
				<Flex justifyContent="flex-end" gap={2}>
					<Skeleton variant="block" width="80px" height="var(--space-6)" />
					<Skeleton variant="block" width="80px" height="var(--space-6)" />
				</Flex>
			</div>
		</div>
	);
}
