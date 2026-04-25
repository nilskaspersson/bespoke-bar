import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCachedRecipeList } from "@/features/lists/api/readRecipeList";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { getRecipeListUrl } from "@/features/lists/utils";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Skeleton, SkeletonScreen } from "@/ui/Skeleton";
import { SubmitButton } from "@/ui/SubmitButton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default function EditRecipeListPage({ params: paramsPromise }: Props) {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Edit List</Heading>

				<Suspense
					fallback={
						<SkeletonScreen>
							<Skeleton width="100%" height="40lvh" />
						</SkeletonScreen>
					}
				>
					<EditRecipeListWithAuth paramsPromise={paramsPromise} />
				</Suspense>
			</Grid>
		</Container>
	);
}

async function EditRecipeListWithAuth({
	paramsPromise,
}: {
	paramsPromise: Promise<{ id?: string }>;
}) {
	const { id } = await paramsPromise;

	if (!id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();

	const [recipeList, recipes] = await Promise.all([
		getCachedRecipeList(orgId, id),
		getCachedBarRecipes(orgId),
	]);

	if (!recipeList) {
		notFound();
	}

	return (
		<>
			<nav>
				<LinkButton
					href={getRecipeListUrl(recipeList)}
					variant="text"
					color="accent"
					size="small"
				>
					<Icon name="angle-left" />
					Back to List
				</LinkButton>
			</nav>

			<RecipeListForm recipeList={recipeList} recipes={recipes}>
				<SubmitButton variant="solid" color="accent">
					<Icon name="pen" />
					Save changes
				</SubmitButton>
			</RecipeListForm>
		</>
	);
}
