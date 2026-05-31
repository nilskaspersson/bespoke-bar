import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { FormDraftPreview } from "@/features/recipes/components/FormDraftPreview";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { getRecipeUrl } from "@/features/recipes/utils";
import { stitchRecipe } from "@/features/recipes/utils/stitchRecipe";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default function EditRecipePage({ params }: Props) {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Edit recipe</Heading>

				<Suspense
					fallback={
						<SkeletonScreen>
							<Skeleton width="100%" height="40lvh" />
						</SkeletonScreen>
					}
				>
					<RecipeEditWithAuth params={params} />
				</Suspense>
			</Grid>
		</Container>
	);
}

async function RecipeEditWithAuth({ params }: Props) {
	const { id } = await params;
	const { orgId } = await authOrForbidden();

	if (!id) {
		notFound();
	}

	const [rawRecipe, ingredients] = await Promise.all([
		getCachedRecipe(orgId, id),
		getCachedIngredients(orgId),
	]);

	if (!rawRecipe) {
		notFound();
	}

	const recipe = stitchRecipe(rawRecipe, { ingredients });

	return (
		<>
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

			<RecipeForm recipe={recipe} ingredients={ingredients}>
				<FormDraftPreview
					ingredients={ingredients}
					aiEnrichedFields={recipe.aiEnrichedFields}
					className={styles.preview}
				/>
			</RecipeForm>
		</>
	);
}
