import type { ComponentProps } from "react";
import { EntityActions } from "@/components/EntityActions";
import type { RecipeListWithEntries } from "@/db/schema/composite";
import { RecipeListActions } from "@/features/lists/actions/components/RecipeListActions";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { getRecipeListUrl } from "@/features/lists/utils";
import { Grid } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import styles from "./styles.module.css";

type Props = {
	lists: RecipeListWithEntries[];
};

export function RecipeListTable({
	lists,
	...props
}: Props & Omit<ComponentProps<typeof Grid>, "list" | "children">) {
	const hasFeaturedList = lists.some((list) => list.isFeatured);

	return (
		<Grid as="ul" gap={6} {...props}>
			{lists.map((list) => (
				<li key={list.id}>
					<RecipeListFrame
						list={list}
						href={getRecipeListUrl(list)}
						className={styles.frame}
					/>

					<EntityActions className={styles.actions}>
						{(actionProps) => (
							<RecipeListActions
								{...actionProps}
								list={list}
								hasFeaturedList={hasFeaturedList}
								withLink
							/>
						)}
					</EntityActions>
				</li>
			))}
		</Grid>
	);
}

function RecipeListTableSkeletonItem() {
	return (
		<li>
			<Skeleton width="100%" height="257px" className={styles.frame} />

			<div className={styles.actions}>
				<Skeleton variant="text" width="430px" height="24px" />
			</div>
		</li>
	);
}

RecipeListTable.Skeleton = function RecipeListTableSkeleton() {
	return (
		<SkeletonScreen>
			<Grid as="ul" gap={6}>
				<RecipeListTableSkeletonItem />
				<RecipeListTableSkeletonItem />
			</Grid>
		</SkeletonScreen>
	);
};
