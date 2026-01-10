import { notFound } from "next/navigation";
import { getCachedIngredients } from "@/features/ingredients/actions/readIngredients";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { getRecipeUrl } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function EditRecipePage({ params }: Props) {
	const { id } = await params;
	const { orgId } = await authOrForbidden();

	if (!id) {
		notFound();
	}

	const [recipe, ingredients] = await Promise.all([
		getCachedRecipe(orgId, id),
		getCachedIngredients(orgId),
	]);

	if (!recipe) {
		notFound();
	}

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<header>
					<nav>
						<LinkButton
							href={getRecipeUrl(recipe)}
							variant="text"
							color="accent"
							size="small"
						>
							<Icon name="angle-left" />
							Back to recipe
						</LinkButton>
					</nav>

					<Heading level="h1">Edit recipe</Heading>
				</header>

				<RecipeForm recipe={recipe} ingredients={ingredients} />
			</Grid>
		</Container>
	);
}
