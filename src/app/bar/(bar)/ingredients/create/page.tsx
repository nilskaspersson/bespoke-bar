import type { Metadata } from "next";
import { PageHeader } from "@/app/components/PageHeader";
import { CreateIngredientForm } from "@/features/ingredients/components/CreateIngredientForm";
import { getOrCreateLocalOrganisation } from "@/features/organisation/actions/getOrCreateLocalOrganisation";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import styles from "./page.module.css";

export default async function CreateIngredientPage() {
	const organisation = await getOrCreateLocalOrganisation();

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<PageHeader heading="Create Ingredient" />

				<CreateIngredientForm organisation={organisation} />
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create Ingredient",
};
