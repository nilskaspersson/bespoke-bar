import type { Metadata } from "next";
import { PageHeader } from "@/app/components/PageHeader";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { Container } from "@/ui/Container";
import styles from "./page.module.css";

export default async function CreateListPage() {
	const recipes = await readBarRecipes();

	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Create List" />

			<RecipeListForm recipes={recipes} />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create List",
};
