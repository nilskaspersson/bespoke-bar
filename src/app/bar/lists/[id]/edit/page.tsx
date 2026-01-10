import { notFound } from "next/navigation";
import { getCachedRecipeList } from "@/features/lists/actions/readRecipeList";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { getRecipeListUrl } from "@/features/lists/utils";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function EditRecipeListPage({
	params: paramsPromise,
}: Props) {
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
							Back to List
						</LinkButton>
					</nav>

					<Heading level="h1">Edit List</Heading>
				</header>

				<RecipeListForm recipeList={recipeList} recipes={recipes}>
					<SubmitButton variant="solid" color="accent">
						<Icon name="pen" />
						Save changes
					</SubmitButton>
				</RecipeListForm>
			</Grid>
		</Container>
	);
}
