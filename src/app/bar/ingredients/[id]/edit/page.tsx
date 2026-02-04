import { notFound, redirect } from "next/navigation";
import { updateIngredientSchema } from "@/db/schema/ingredients";
import { getCachedIngredient } from "@/features/ingredients/api/readIngredient";
import { updateIngredient } from "@/features/ingredients/api/updateIngredient";
import { IngredientForm } from "@/features/ingredients/components/IngredientForm";
import { getIngredientUrl } from "@/features/ingredients/utils";
import { percentageToRatioSchema } from "@/features/ingredients/utils/percentageToRatio";
import { Container } from "@/ui/Container";
import { Grid } from "@/ui/Grid";
import { Heading } from "@/ui/Heading";
import { authOrForbidden } from "@/utils/auth";
import styles from "./page.module.css";

type Props = {
	params: Promise<{ id?: string }>;
	searchParams: Promise<{ returnTo?: string }>;
};

export default async function EditIngredientPage({
	params: paramsPromise,
	searchParams: searchParamsPromise,
}: Props) {
	const [{ id }, { returnTo }] = await Promise.all([
		paramsPromise,
		searchParamsPromise,
	]);

	if (!id) {
		notFound();
	}

	const { orgId } = await authOrForbidden();
	const ingredient = await getCachedIngredient(orgId, id);

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

		redirect(returnTo ?? getIngredientUrl(ingredient));
	};

	return (
		<Container as="article" className={styles.container}>
			<Grid gap={4}>
				<Heading level="h1">Edit ingredient</Heading>

				<form action={formAction}>
					<IngredientForm ingredient={ingredient} />
				</form>
			</Grid>
		</Container>
	);
}
