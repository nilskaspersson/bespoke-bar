import { EmptyArea } from "@/app/components/EmptyArea";
import { EntityActions } from "@/app/components/EntityActions";
import { WelcomeMessage } from "@/app/components/WelcomeMessage";
import { readFeaturedList } from "@/features/lists/actions/readFeaturedList";
import { ListItemActions } from "@/features/lists/components/ListItemActions";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default async function BarPage() {
	const featuredList = await readFeaturedList();

	return (
		<Container as="article" className={styles.container}>
			<WelcomeMessage />

			<Grid as="section" gap={6}>
				{featuredList ? (
					<div>
						<RecipeListFrame
							list={featuredList}
							recipeCount={featuredList.entries.length}
							className={styles.featuredList}
						>
							<RecipeListFilters list={featuredList} />
						</RecipeListFrame>

						<EntityActions className={styles.featuredListActions}>
							{(actionProps) => (
								<ListItemActions
									{...actionProps}
									list={featuredList}
									recipeCount={featuredList.entries.length}
									hasFeaturedList
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
							Your Featured List will be displayed here for easy access.
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
		</Container>
	);
}
