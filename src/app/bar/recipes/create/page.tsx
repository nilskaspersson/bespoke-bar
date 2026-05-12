import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { LinkButton } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";
import styles from "./page.module.css";

export default function CreateRecipePage() {
	return (
		<section className={styles.intro}>
			<Grid
				justifyContent="center"
				alignContent="center"
				justifyItems="center"
				gap={3}
				className={styles.content}
			>
				<Text as="p" align="center">
					Choose a method to create your Recipe.
				</Text>

				<LinkButton
					href="/bar/recipes"
					size="small"
					variant="ghost"
					color="accent"
				>
					View all Recipes
				</LinkButton>
			</Grid>

			<CreateRecipeNav />
		</section>
	);
}
