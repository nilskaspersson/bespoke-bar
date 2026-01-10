import type { ComponentProps } from "react";
import { EmptyArea } from "@/app/components/EmptyArea";
import { EntityActions } from "@/app/components/EntityActions";
import { getCachedFeaturedList } from "@/features/lists/api/readFeaturedList";
import { RecipeListActions } from "@/features/lists/components/RecipeListActions";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { LinkButton } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import { authOrForbidden } from "@/utils/auth";
import styles from "./styles.module.css";

export async function FeaturedList(
	props: Omit<ComponentProps<typeof Grid>, "children">,
) {
	const { orgId } = await authOrForbidden();
	const featuredList = await getCachedFeaturedList(orgId);

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
								{...actionProps}
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
