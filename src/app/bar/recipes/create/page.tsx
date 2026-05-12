import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { LinkButton } from "@/ui/Button";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";

export default function CreateRecipePage() {
	return (
		<Grid gap={6}>
			<Text as="p">Choose a method to create your Recipe.</Text>

			<CreateRecipeNav>
				<LinkButton
					href="/bar/recipes"
					size="tiny"
					variant="text"
					color="accent"
				>
					View all Recipes
				</LinkButton>
			</CreateRecipeNav>
		</Grid>
	);
}
