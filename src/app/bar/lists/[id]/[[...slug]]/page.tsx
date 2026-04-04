import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EntityActions } from "@/components/EntityActions";
import { OrgProvider } from "@/components/OrgProvider";
import { PageHeader } from "@/components/PageHeader";
import { RecipeListActions } from "@/features/lists/actions/components/RecipeListActions";
import { getCachedRecipeList } from "@/features/lists/api/readRecipeList";
import { EmptyListEntry } from "@/features/lists/components/EmptyListEntry";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { getCachedFeaturedList } from "@/features/lists/featured/api/readFeaturedList";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
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
export default function RecipeListPage({ params }: Props) {
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

	const [list, featuredList] = await Promise.all([
		getCachedRecipeList(orgId, id),
		getCachedFeaturedList(orgId),
	]);

	if (!list) {
		notFound();
	}

	return (
		<OrgProvider>
			<RecipeListFrame level="h2" list={list} className={styles.frame}>
				<Grid gap={8}>
					<RecipeListFilters list={list} editable withActions />
					<EmptyListEntry list={list} />
				</Grid>
			</RecipeListFrame>

			<EntityActions className={styles.actions}>
				{(actionProps) => (
					<RecipeListActions
						actionProps={actionProps}
						list={list}
						hasFeaturedList={Boolean(featuredList)}
						deleteRedirectTo={"/bar/lists"}
					/>
				)}
			</EntityActions>
		</OrgProvider>
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
	const list = await getCachedRecipeList(orgId, id);

	if (!list) {
		return {
			title: "List not found",
		};
	}

	return {
		title: list.name || "Unnamed List",
		alternates: {
			canonical: `/bar/lists/${list.id}`,
		},
	};
}
