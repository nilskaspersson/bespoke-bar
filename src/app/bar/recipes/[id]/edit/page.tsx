import { notFound } from "next/navigation";
import { readRecipe } from "@/features/recipes/actions/readRecipe";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { getRecipeUrl } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function EditRecipePage({ params: paramsPromise }: Props) {
	const { id } = await paramsPromise;
	const recipe = await readRecipe(id);

	if (!recipe) {
		notFound();
	}

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<nav>
					<LinkButton href={getRecipeUrl(recipe)} variant="text" color="accent">
						<Icon name="angle-left" />
						Back to recipe
					</LinkButton>
				</nav>

				<header>
					<Heading level="h1">Edit recipe</Heading>
				</header>

				<RecipeForm recipe={recipe} />
			</Grid>
		</Container>
	);
}
