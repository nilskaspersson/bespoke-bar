import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { LinkButton } from "@/ui/Button";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

export default function CreateRecipePage() {
	return (
		<>
			<PageHeader
				overline="Recipes"
				icon="duotone-martini-glass"
				heading="Create Recipes"
				tagline="Choose a method for creating your next cocktail."
			>
				<LinkButton
					href="/bar/recipes"
					variant="outline"
					color="accent"
					rounded
				>
					<Icon name="arrow-left" />
					All Recipes
				</LinkButton>
			</PageHeader>

			<CreateRecipeNav className={styles.nav} />
		</>
	);
}

export const metadata: Metadata = {
	title: "Create a Recipe",
};
