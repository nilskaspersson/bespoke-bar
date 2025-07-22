import { notFound } from "next/navigation";
import { readRecipeList } from "@/features/lists/actions/readRecipeList";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { getRecipeListUrl } from "@/features/lists/utils";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function EditRecipeListPage({
	params: paramsPromise,
}: Props) {
	const { id } = await paramsPromise;

	const [recipeList, recipes] = await Promise.all([
		readRecipeList(id),
		readBarRecipes(),
	]);

	if (!recipeList) {
		notFound();
	}

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<header>
					<nav>
						<LinkButton
							href={getRecipeListUrl(recipeList)}
							variant="text"
							color="accent"
							size="small"
						>
							<Icon name="angle-left" />
							Back to list
						</LinkButton>
					</nav>

					<Heading level="h1">Edit recipe</Heading>
				</header>

				<RecipeListForm recipeList={recipeList} recipes={recipes} />
			</Grid>
		</Container>
	);
}
