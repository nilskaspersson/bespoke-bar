import type { Metadata } from "next";
import { CreateIngredientForm } from "@/features/ingredients/components/CreateIngredientForm";
import { getOrCreateLocalOrganisation } from "@/features/organisation/actions/getOrCreateLocalOrganisation";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import styles from "./page.module.css";

export default async function CreateIngredientPage() {
	const organisation = await getOrCreateLocalOrganisation();

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Create Ingredient</Heading>

				<CreateIngredientForm organisation={organisation} />
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create Ingredient",
};
