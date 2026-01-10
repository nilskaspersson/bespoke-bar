import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getUserById } from "@/features/organisation/actions/getUserById";
import { FALLBACK_USER_NAME } from "@/features/organisation/constants";
import { getFullName } from "@/features/organisation/utils";
import { getCachedRecipe } from "@/features/recipes/api/readRecipe";
import { RecipeActions } from "@/features/recipes/actions/components/RecipeActions";
import { RecipeArticle } from "@/features/recipes/components/RecipeArticle";
import { Container } from "@/ui/Container";
import { authOrForbidden } from "@/utils/auth";
import { isValidPageUrl } from "@/utils/url";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string; slug?: string[] }>;
};

/**
 * [[...slug]] enables suffixing the URL with a slug of the recipe name for
 * improved readability of links.
 */
export default async function RecipePage({ params }: Props) {
	return (
		<Container className={styles.container}>
			<Suspense fallback={<RecipeArticle.Skeleton />}>
				<RecipeContent params={params} />
			</Suspense>
		</Container>
	);
}

async function RecipeContent({ params }: Props) {
	const { id, slug } = await params;

	if (!isValidPageUrl(id, slug) || !id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();
	const recipe = await getCachedRecipe(orgId, id);

	if (!recipe) {
		notFound();
	}

	return (
		<RecipeArticle recipe={recipe}>
			<RecipeActions recipe={recipe} className={styles.actions} />
		</RecipeArticle>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	if (!id) {
		return {
			title: "Recipe not found",
		};
	}

	const { orgId } = await authOrForbidden();
	const recipe = await getCachedRecipe(orgId, id);

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
