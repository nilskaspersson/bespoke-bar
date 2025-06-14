import { notFound } from "next/navigation";
import { updateRecipeSchema } from "@/db/schema/recipes";
import { readRecipe } from "@/features/recipes/actions/readRecipe";
import { updateRecipe } from "@/features/recipes/actions/updateRecipe";
import { RecipeName } from "@/features/recipes/components/RecipeName";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { GradientText } from "@/ui/GradientText";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { TextField } from "@/ui/TextField";

type Props = {
	params: Promise<{ id?: string }>;
};

export default async function EditRecipePage({ params: paramsPromise }: Props) {
	const { id } = await paramsPromise;
	const recipe = await readRecipe(id);

	if (!recipe) {
		notFound();
	}

	const formAction = async (formData: FormData) => {
		"use server";

		const values = updateRecipeSchema.parse({
			name: formData.get("name"),
			description: formData.get("description"),
		});

		await updateRecipe(recipe.id, values);
	};

	return (
		<Container as="article">
			<Grid gap={4}>
				<Heading level="h1">
					Edit recipe{" "}
					<GradientText>
						<RecipeName recipe={recipe} />
					</GradientText>
				</Heading>

				<form action={formAction}>
					<Grid gap={4}>
						<TextField
							label="Name"
							name="name"
							defaultValue={recipe.name ?? ""}
						/>

						<TextField
							as="textarea"
							label="Description"
							name="description"
							defaultValue={recipe.description ?? ""}
						/>

						<div>
							<Button type="submit">Save</Button>
						</div>
					</Grid>
				</form>

				<ul>
					{recipe.specs.map((spec) => (
						<li key={spec.id}>
							{spec.quantity} {spec.unit} {spec.ingredient.name}
						</li>
					))}
				</ul>
			</Grid>
		</Container>
	);
}
