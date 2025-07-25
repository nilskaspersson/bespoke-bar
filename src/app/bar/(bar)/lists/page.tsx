import type { Metadata } from "next";
import { PageHeader } from "@/app/components/PageHeader";
import { readBarRecipeLists } from "@/features/lists/actions/readBarRecipeLists";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { getRecipeListUrl } from "@/features/lists/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

export default async function ListsPage() {
	const lists = await readBarRecipeLists();

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

			<Grid as="ul" gap={8}>
				{lists.map((list) => (
					<li key={list.id}>
						<RecipeListFrame
							list={list}
							href={getRecipeListUrl(list)}
							recipeCount={list.recipeCount}
							className={styles.list}
						/>
					</li>
				))}
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Lists",
};
