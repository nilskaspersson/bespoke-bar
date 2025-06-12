import { CreateIngredientForm } from "@/features/ingredients/components/CreateIngredientForm";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";

export default function CreateIngredientPage() {
	return (
		<Container as="article">
			<Grid gap={4}>
				<Heading level="h1">Create Ingredient</Heading>

				<CreateIngredientForm />
			</Grid>
		</Container>
	);
}
