import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EntityActions } from "@/app/components/EntityActions";
import { PageHeader } from "@/app/components/PageHeader";
import { getCachedFeaturedList } from "@/features/lists/actions/readFeaturedList";
import { getCachedRecipeList } from "@/features/lists/actions/readRecipeList";
import { RecipeListActions } from "@/features/lists/components/RecipeListActions";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { Container } from "@/ui/Container";
import { authOrForbidden } from "@/utils/auth";
import { isValidPageUrl } from "@/utils/url";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string; slug?: string[] }>;
};

/**
 * [[...slug]] enables suffixing the URL with a slug of the list name for
 * improved readability of links.
 */
export default async function RecipeListPage({ params }: Props) {
	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Recipe List" />

			<Suspense fallback={<div>Loading...</div>}>
				<RecipeListContent params={params} />
			</Suspense>
		</Container>
	);
}

async function RecipeListContent({ params }: Props) {
	const { id, slug } = await params;

	if (!isValidPageUrl(id, slug) || !id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();

	const [recipeList, featuredList] = await Promise.all([
		getCachedRecipeList(orgId, id),
		getCachedFeaturedList(orgId),
	]);

	if (!recipeList) {
		notFound();
	}

	return (
		<>
			<RecipeListFrame level="h2" list={recipeList} className={styles.frame}>
				<RecipeListFilters list={recipeList} editable />
			</RecipeListFrame>

			<EntityActions className={styles.actions}>
				{(actionProps) => (
					<RecipeListActions
						{...actionProps}
						list={recipeList}
						hasFeaturedList={Boolean(featuredList)}
						deleteRedirectTo={"/bar/lists"}
					/>
				)}
			</EntityActions>
		</>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;

	if (!id) {
		return {
			title: "List not found",
		};
	}

	const { orgId } = await authOrForbidden();
	const recipeList = await getCachedRecipeList(orgId, id);

	if (!recipeList) {
		return {
			title: "List not found",
		};
	}

	return {
		title: recipeList.name || "Unnamed List",
		alternates: {
			canonical: `/bar/lists/${recipeList.id}`,
		},
	};
}
