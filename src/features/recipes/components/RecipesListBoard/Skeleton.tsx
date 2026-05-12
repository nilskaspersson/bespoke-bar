import { RecipesListSkeleton } from "@/features/recipes/components/RecipesList";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import skeletonStyles from "./Skeleton.module.css";
import styles from "./styles.module.css";

export function RecipesListBoardSkeleton() {
	return (
		<SkeletonScreen className={styles.board}>
			<div className={styles.filtersSection}>
				<div className={skeletonStyles.heroSlot}>
					<Skeleton
						variant="input"
						width="100%"
						height="var(--space-7)"
						className={skeletonStyles.search}
					/>
					<div className={skeletonStyles.chips}>
						<Skeleton width="4rem" height="var(--space-5)" />
						<Skeleton width="5rem" height="var(--space-5)" />
						<Skeleton width="3.5rem" height="var(--space-5)" />
						<Skeleton width="4.5rem" height="var(--space-5)" />
					</div>
				</div>

				<div className={skeletonStyles.statsSlot}>
					<div className={skeletonStyles.statsRow}>
						<Skeleton width="10rem" height="var(--space-3)" />
						<div className={skeletonStyles.statsTiles}>
							<Skeleton width="3rem" height="var(--space-6)" />
							<Skeleton width="4rem" height="var(--space-6)" />
						</div>
					</div>
					<Skeleton width="100%" height="10px" />
				</div>
			</div>

			<div className={styles.listSlot}>
				<RecipesListSkeleton />
			</div>

			<div className={styles.actionsSlot}>
				<Skeleton
					width="14rem"
					height="var(--space-7)"
					className={skeletonStyles.dock}
				/>
			</div>
		</SkeletonScreen>
	);
}
