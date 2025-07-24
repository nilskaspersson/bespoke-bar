import type { Metadata } from "next";
import { PageHeader } from "@/app/components/PageHeader";
import { readIngredients } from "@/features/ingredients/actions/readIngredients";
import { IngredientTable } from "@/features/ingredients/components/IngredientsTable";
import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

export default async function IngredientsPage() {
	const ingredients = await readIngredients();

	return (
		<Container as="article" className={styles.container}>
			<PageHeader
				heading="Ingredients"
				actions={
					<LinkButton
						href="/bar/ingredients/create"
						variant="solid"
						color="accent"
						size="small"
					>
						Create Ingredient
						<Icon name="duotone-wine-bottle" />
					</LinkButton>
				}
			/>

			<IngredientTable ingredients={ingredients} />
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Ingredients",
};
