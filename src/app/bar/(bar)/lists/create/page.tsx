import type { Metadata } from "next";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import styles from "./page.module.css";

export default async function CreateListPage() {
	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Create List</Heading>

				<RecipeListForm />
			</Grid>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create List",
};
