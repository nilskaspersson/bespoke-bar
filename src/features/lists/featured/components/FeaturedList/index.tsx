import { cacheTag } from "next/cache";
import type { ComponentProps } from "react";
import { EmptyArea } from "@/components/EmptyArea";
import { EntityActions } from "@/components/EntityActions";
import { RecipeListActions } from "@/features/lists/actions/components/RecipeListActions";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { readFeaturedList } from "@/features/lists/featured/api/readFeaturedList";
import { LinkButton } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import { cacheTags } from "@/utils/cache";
import styles from "./styles.module.css";

type FeaturedListProps = Omit<ComponentProps<typeof Grid>, "children"> & {
	orgId: string;
};

export async function FeaturedList({ orgId, ...props }: FeaturedListProps) {
	"use cache";

	const featuredList = await readFeaturedList(orgId);
	cacheTag(...cacheTags.recipeListWithRecipes(orgId, featuredList?.id));

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
