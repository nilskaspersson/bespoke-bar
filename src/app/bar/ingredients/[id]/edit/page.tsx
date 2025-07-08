import { notFound } from "next/navigation";
import { updateIngredientSchema } from "@/db/schema/ingredients";
import { readIngredient } from "@/features/ingredients/actions/readIngredient";
import { updateIngredient } from "@/features/ingredients/actions/updateIngredient";
import { IngredientForm } from "@/features/ingredients/components/IngredientForm";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function EditIngredientPage({
	params: paramsPromise,
}: Props) {
	const { id } = await paramsPromise;
	const ingredient = await readIngredient(id);

	if (!ingredient) {
		notFound();
	}

	const formAction = async (formData: FormData) => {
		"use server";

		const values = updateIngredientSchema.parse({
			name: formData.get("name"),
			category: formData.get("category"),
			description: formData.get("description"),
			abv: percentageToRatioSchema.parse(formData.get("abv")),
			brand: formData.get("brand"),
			unitCost: formData.get("unitCost"),
			measurementType: formData.get("measurementType"),
		});

		await updateIngredient(ingredient.id, values);
	};

	return (
		<Container as="article">
			<Grid gap={4}>
				<Heading level="h1">Edit ingredient</Heading>

				<form action={formAction}>
					<IngredientForm ingredient={ingredient} />
				</form>
			</Grid>
		</Container>
	);
}
