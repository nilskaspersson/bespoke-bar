import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

export default async function RecipesPage() {
	const recipes = await readBarRecipes();

	const members = await readOrganisationMembers();

	return (
		<Container as="article" className={styles.container}>
			<Flex as="header" gap={2} justifyContent="space-between">
				<Heading level="h1">Recipes</Heading>

				<Flex gap={2}>
					<LinkButton href="/bar/recipes/archive" variant="ghost">
						Archive
					</LinkButton>

					<LinkButton href="/bar/recipes/create" variant="solid" color="heavy">
						Create Recipe
						<Icon name="pen" />
					</LinkButton>
				</Flex>
			</Flex>

			<RecipeTable recipes={recipes} members={members} />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Recipes",
};
