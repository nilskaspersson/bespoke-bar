import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RecipeListForm } from "@/features/lists/components/RecipeListForm";
import { getCachedBarRecipes } from "@/features/recipes/api/readBarRecipes";
import { Container } from "@/ui/Container";
import { Icon } from "@/ui/Icon";
import { SubmitButton } from "@/ui/SubmitButton";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

export default async function CreateListPage() {
	const { orgId } = await authOrForbidden();
	const recipes = await getCachedBarRecipes(orgId);

	return (
		<Container as="article" className={styles.container}>
			<PageHeader heading="Create List" />

			<RecipeListForm recipes={recipes}>
				<SubmitButton variant="solid" color="accent">
					<Icon name="plus" />
					Create List
				</SubmitButton>
			</RecipeListForm>
		</Container>
	);
}

export const metadata: Metadata = {
	title: "Create List",
};
