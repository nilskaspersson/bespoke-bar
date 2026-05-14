import { EmptyArea } from "@/components/EmptyArea";
import { EntityActions } from "@/components/EntityActions";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { RecipeListActions } from "@/features/lists/actions/components/RecipeListActions";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { getCachedFeaturedList } from "@/features/lists/featured/api/readFeaturedList";
import {
	buildIngredientMap,
	stitchRecipeListEntries,
} from "@/features/specs/utils/stitchIngredients";
import { LinkButton } from "@/ui/Button";
import { Grid, type GridProps } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

type FeaturedListProps = Omit<GridProps, "children"> & {
	orgId: string;
};

/**
 * Not a `'use cache'` boundary on purpose: an outer cache would inherit
 * `getCachedIngredients`'s tags and invalidate on every ingredient mutation.
 */
export async function FeaturedList({ orgId, ...props }: FeaturedListProps) {
	const [rawList, ingredients] = await Promise.all([
		getCachedFeaturedList(orgId),
		getCachedIngredients(orgId),
	]);

	const featuredList = rawList
		? stitchRecipeListEntries(rawList, buildIngredientMap(ingredients))
		: null;

	return (
		<Grid as="section" gap={6} {...props}>
			{featuredList ? (
				<div>
					<RecipeListFrame list={featuredList} className={styles.list}>
						<RecipeListFilters list={featuredList} />
					</RecipeListFrame>

					<EntityActions className={styles.actions}>
						{(actionProps) => (
							<RecipeListActions
								actionProps={actionProps}
								list={featuredList}
								hasFeaturedList
								withLink
							/>
						)}
					</EntityActions>
				</div>
			) : (
				<EmptyArea color="amber">
					<Heading level="h3" size={6}>
						No Featured List
					</Heading>

					<Text size={2}>
						You can select a Featured List to be displayed for easy access.
					</Text>

					<LinkButton
						href="/bar/lists"
						variant="outline"
						color="amber"
						size="small"
					>
						Select a List to feature
					</LinkButton>
				</EmptyArea>
			)}
		</Grid>
	);
}
