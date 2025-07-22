import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readRecipeList } from "@/features/lists/actions/readRecipeList";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
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
			<Heading level="h1">{recipeList.name}</Heading>
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
