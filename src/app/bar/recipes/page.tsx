import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";

import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default async function RecipesPage() {
	const [recipes, members] = await Promise.all([
		readBarRecipes(),
		readOrganisationMembers(),
	]);

	return (
		<Container as="article" className={styles.container}>
			<header>
				<Heading level="h1">Recipes</Heading>
			</header>

			<Flex gap={2} justifyContent="space-between">
				<div>
					<Text as="div" size={1} compact>
						{recipes.length === 1 ? "Recipe" : "Recipes"}
					</Text>

					<Text as="div" size={5} heavy weight={600} compact>
						{recipes.length}
					</Text>
				</div>

				<LinkButton href="/bar/recipes/create" variant="solid" color="heavy">
					Create Recipe
					<Icon name="pen" />
				</LinkButton>
			</Flex>

			<RecipeTable
				recipes={recipes}
				members={members}
				className={styles.table}
			/>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Recipes",
};
