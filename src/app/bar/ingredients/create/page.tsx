import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CreateIngredientForm } from "@/features/ingredients/components/CreateIngredientForm";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import styles from "./page.module.css";

export default async function CreateIngredientPage() {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<PageHeader heading="Create Ingredient" />

				<CreateIngredientForm />
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create Ingredient",
};
