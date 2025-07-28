import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityActions } from "@/app/components/EntityActions";
import { PageHeader } from "@/app/components/PageHeader";
import { readFeaturedList } from "@/features/lists/actions/readFeaturedList";
import { readRecipeList } from "@/features/lists/actions/readRecipeList";
import { ListItemActions } from "@/features/lists/components/ListItemActions";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { Container } from "@/ui/Container";
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
	const { id, slug } = await params;

	if (!isValidPageUrl(id, slug)) {
		notFound();
	}

	const [recipeList, featuredList] = await Promise.all([
		readRecipeList(id),
		readFeaturedList(),
	]);

	if (!recipeList) {
		notFound();
	}

	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading={recipeList.name} />

			<RecipeListFrame
				level="h2"
				list={recipeList}
				recipeCount={recipeList.entries.length}
				className={styles.frame}
			>
				<RecipeListFilters list={recipeList} editable />
			</RecipeListFrame>

			<EntityActions className={styles.actions}>
				{(actionProps) => (
					<ListItemActions
						{...actionProps}
						list={recipeList}
						hasFeaturedList={Boolean(featuredList)}
					/>
				)}
			</EntityActions>
		</Container>
	);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const recipeList = await readRecipeList(id);

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
