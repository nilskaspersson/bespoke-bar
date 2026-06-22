"use client";

import { Grid } from "@bespoke/ui/Grid";
import { Skeleton, SkeletonScreen } from "@bespoke/ui/Skeleton";
import { toCSSVars } from "@bespoke/ui/utils/styles";
import { RecipesListSkeleton } from "@/features/recipes/components/RecipesList";
import { RecipesListHeader } from "@/features/recipes/components/RecipesListHeader";
import skeletonStyles from "./Skeleton.module.css";
import styles from "./styles.module.css";

function noop() {}

const DIST_WEIGHTS = [100, 5, 4, 2, 1, 1];

export function RecipesListBoardSkeleton() {
	return (
		<div className={styles.board}>
			<Grid gap={8} className={styles.filtersSection}>
				<RecipesListHeader
					search=""
					onSearchChange={noop}
					filtersOpen={false}
					onOpenFilters={noop}
				/>

				<SkeletonScreen className={skeletonStyles.statsSlot}>
					<div className={skeletonStyles.statsRow}>
						<div className={skeletonStyles.statTile}>
							<Skeleton width="4rem" height="var(--space-3)" />
							<Skeleton width="2.5rem" height="var(--size-6)" />
						</div>

						<div className={skeletonStyles.statTile}>
							<Skeleton width="3.5rem" height="var(--space-3)" />
							<Skeleton width="4.5rem" height="var(--size-6)" />
						</div>
					</div>

					<div className={skeletonStyles.distBar}>
						{DIST_WEIGHTS.map((weight, i) => (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder weights
								key={i}
								className={skeletonStyles.distSeg}
								style={toCSSVars({ jsxFlexGrow: weight })}
							/>
						))}
					</div>

					<div className={skeletonStyles.chips}>
						<Skeleton width="6rem" height="1.25rem" />
						<Skeleton width="4.5rem" height="1.25rem" />
						<Skeleton width="5.5rem" height="1.25rem" />
						<Skeleton width="4rem" height="1.25rem" />
					</div>
				</SkeletonScreen>
			</Grid>

			<div className={styles.listSlot}>
				<RecipesListSkeleton />
			</div>
		</div>
	);
}
