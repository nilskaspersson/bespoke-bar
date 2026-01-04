import { CreateRecipeNav } from "@/features/recipes/components/CreateRecipeNav";
import { Grid } from "@/ui/Grid";
import { Text } from "@/ui/Text";

export default function CreateRecipePage() {
	return (
		<Grid gap={6}>
			<Text as="p">Choose a method to create your Recipe.</Text>
			<CreateRecipeNav />
		</Grid>
	);
}
