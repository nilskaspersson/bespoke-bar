import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { getCachedRecipeLists } from "@/features/lists/actions/readBarRecipeLists";
import { RecipeListTable } from "@/features/lists/components/RecipeListTable";
import { LinkButton } from "@/ui/Button";
import { Callout } from "@/ui/Callout";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default async function ListsPage() {
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
						<Text as="dfn" heavy weight={600}>
							Lists
						</Text>
						, you can further organize your recipes, set and calculate Recipe
						prices, generate menus for your guests, and more.
					</Text>
				</Grid>
			</Callout>

			<Suspense fallback={<RecipeListTable.Skeleton />}>
				<RecipeListData />
			</Suspense>
		</Container>
	);
}

async function RecipeListData() {
	const { orgId } = await authOrForbidden();
	const lists = await getCachedRecipeLists(orgId);

	return <RecipeListTable lists={lists} />;
}

export const metadata: Metadata = {
	title: "Lists",
};
