import type { Metadata } from "next";
import { readIngredients } from "@/features/ingredients/actions/readIngredients";
import { IngredientTable } from "@/features/ingredients/components/IngredientsTable";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Flex } from "@/ui/Flex";
import { Heading } from "@/ui/Heading";
import styles from "./page.module.css";

export default async function IngredientsPage() {
	const ingredients = await readIngredients();

	return (
		<Container as="article" className={styles.container}>
			<Flex
				as="header"
				justifyContent="space-between"
				alignItems="center"
				wrap
				gap={4}
			>
				<Heading level="h1">Ingredients</Heading>

				<LinkButton
					href="/bar/ingredients/create"
					variant="solid"
					color="accent"
					size="small"
				>
					Create Ingredient
				</LinkButton>
			</Flex>

			<IngredientTable ingredients={ingredients} />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Ingredients",
};
