import type { Metadata } from "next";
import { EntityActions } from "@/app/components/EntityActions";
import { PageHeader } from "@/app/components/PageHeader";
import { readBarRecipeLists } from "@/features/lists/actions/readBarRecipeLists";
import { ListItemActions } from "@/features/lists/components/ListItemActions";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { getRecipeListUrl } from "@/features/lists/utils";
import { LinkButton } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default async function ListsPage() {
	const lists = await readBarRecipeLists();

	const hasFeaturedList = lists.some((list) => list.isFeatured);

	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				heading="Lists"
				actions={
					<LinkButton
						href="/bar/lists/create"
						variant="solid"
						color="accent"
						size="small"
					>
						Create List
						<Icon name="duotone-memo-pad" />
					</LinkButton>
				}
			/>

			<Callout variant="inset" color="light" size={7}>
				<Grid gap={3}>
					<Heading level="h2" size={4}>
						Time for a new Cocktail List?
					</Heading>

					<Text as="p" size={3}>
						With{" "}
						<Text as="strong" heavy weight={600}>
							Lists
						</Text>
						, you can further organize your recipes, set and calculate Recipe
						prices, generate menus for your guests, and more.
					</Text>
				</Grid>
			</Callout>

			<Grid as="ul" gap={6}>
				{lists.map((list) => (
					<li key={list.id}>
						<RecipeListFrame
							list={list}
							href={getRecipeListUrl(list)}
							recipeCount={list.recipeCount}
							className={styles.list}
						/>

						<EntityActions className={styles.actions}>
							{(actionProps) => (
								<ListItemActions
									{...actionProps}
									list={list}
									hasFeaturedList={hasFeaturedList}
								/>
							)}
						</EntityActions>
					</li>
				))}
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Lists",
};
