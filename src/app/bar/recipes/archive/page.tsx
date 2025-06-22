import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";
import { Container } from "@/ui/Container";
import { Heading } from "@/ui/Heading";
import styles from "./page.module.css";

export default async function ArchivedRecipesPage() {
	const archivedRecipes = await readBarRecipes({ archivedRecipes: true });

	const members = await readOrganisationMembers();

	return (
		<Container as="article" className={styles.container}>
			<header>
				<Heading level="h1">Archive</Heading>
			</header>

			<RecipeTable recipes={archivedRecipes} members={members} />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Archive",
};
