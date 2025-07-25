import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/PageHeader";
import { clearFeaturedList } from "@/features/lists/actions/clearFeaturedList";
import { readRecipeList } from "@/features/lists/actions/readRecipeList";
import { setFeaturedList } from "@/features/lists/actions/setFeaturedList";
import { ClearFeaturedListButton } from "@/features/lists/components/ClearFeaturedListButton";
import { RecipeListFilters } from "@/features/lists/components/RecipeListFilters";
import { RecipeListFrame } from "@/features/lists/components/RecipeListFrame";
import { SetFeaturedListButton } from "@/features/lists/components/SetFeaturedListButton";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
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

	const recipeList = await readRecipeList(id);

	if (!recipeList) {
		notFound();
	}

	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				heading={recipeList.name}
				actions={
					recipeList.isFeatured ? (
						<ClearFeaturedListButton
							list={recipeList}
							actionSetFeatured={setFeaturedList}
							actionClearFeatured={clearFeaturedList}
							variant="outline"
							color="light"
							size="small"
						>
							Remove from Featured
						</ClearFeaturedListButton>
					) : (
						<SetFeaturedListButton
							list={recipeList}
							actionSetFeatured={setFeaturedList}
							actionClearFeatured={clearFeaturedList}
							variant="solid"
							color="amber"
							size="small"
						>
							<Icon name="star" />
							Set as Featured List
						</SetFeaturedListButton>
					)
				}
			/>

			<RecipeListFrame
				level="h2"
				list={recipeList}
				recipeCount={recipeList.entries.length}
				className={styles.list}
			>
				<RecipeListFilters entries={recipeList.entries} />
			</RecipeListFrame>
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
