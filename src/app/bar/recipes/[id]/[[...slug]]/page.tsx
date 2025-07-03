import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserById } from "@/features/organisation/actions/getUserById";
import { FALLBACK_USER_NAME } from "@/features/organisation/constants";
import { getFullName } from "@/features/organisation/utils";
import {
	archiveRecipe,
	unarchiveRecipe,
} from "@/features/recipes/actions/archiveRecipe";
import { deleteRecipe } from "@/features/recipes/actions/deleteRecipe";
import { readRecipe } from "@/features/recipes/actions/readRecipe";
import { DeleteRecipe } from "@/features/recipes/components/DeleteRecipe";
import { RecipeArticle } from "@/features/recipes/components/RecipeArticle";
import { isValidRecipeParams } from "@/features/recipes/utils";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Grid } from "@/ui/Grid";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string; slug?: string[] }>;
};

/**
 * [[...slug]] enables suffixing the URL with a slug of the recipe name for
 * improved readability of links.
 */
export default async function RecipePage({ params }: Props) {
	const { id, slug } = await params;

	if (!isValidRecipeParams(id, slug)) {
		notFound();
	}

	const recipe = await readRecipe(id);

	if (!recipe) {
		notFound();
	}

	return (
		<Container asChild className={styles.container}>
			<Grid gap={9}>
				<RecipeArticle recipe={recipe} />

				<Flex gap={2} justifyContent="center">
					<LinkButton
						href={`/bar/recipes/${id}/edit`}
						variant="outline"
						color="heavy"
						size="small"
					>
						<Icon name="pen" /> Edit
					</LinkButton>

					{recipe.archivedAt ? (
						<form action={unarchiveRecipe.bind(null, { id: recipe.id })}>
							<SubmitButton variant="solid" color="heavy" size="small">
								Unarchive
							</SubmitButton>
						</form>
					) : (
						<form
							action={archiveRecipe.bind(null, {
								id: recipe.id,
								redirectTo: "/bar/recipes",
							})}
						>
							<SubmitButton variant="ghost" color="light" size="small">
								Archive
							</SubmitButton>
						</form>
					)}

					<DeleteRecipe
						recipe={recipe}
						action={deleteRecipe.bind(null, {
							id: recipe.id,
							redirectTo: "/bar/recipes",
						})}
					>
						<Icon name="trash" /> Delete
					</DeleteRecipe>
				</Flex>
			</Grid>
		</Container>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const recipe = await readRecipe(id);

	if (!recipe) {
		return {
			title: "Recipe not found",
		};
	}

	const author = await getUserById(recipe.createdBy);

	return {
		title: recipe.name || "Unnamed Recipe",
		/**
		 * We often generate links with a human-readable suffix of the recipe name. Add a
		 * canonical reference to the plain URL with only the recipe ID.
		 */
		alternates: {
			canonical: `/bar/recipes/${recipe.id}`,
		},
		authors: {
			name: getFullName(author) || FALLBACK_USER_NAME,
		},
	};
}
