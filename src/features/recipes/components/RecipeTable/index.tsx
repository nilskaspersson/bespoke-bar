import { Grid } from "@/ui/Grid";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";

export function RecipeTableSkeleton() {
	return (
		<SkeletonScreen>
			<Grid gap={4}>
				<Skeleton width="100%" height="147px" />
				<Skeleton width="100%" height="147px" />
				<Skeleton width="100%" height="147px" />
			</Grid>
		</SkeletonScreen>
	);
}
