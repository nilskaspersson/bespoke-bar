import type { Metadata } from "next";
import { PageHeader } from "@/app/components/PageHeader";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { getCachedBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { Container } from "@/ui/Container";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default async function CreateListPage() {
	const { orgId } = await authOrForbidden();
	const recipes = await getCachedBarRecipes(orgId);

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
