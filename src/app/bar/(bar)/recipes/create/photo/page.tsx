import type { Metadata } from "next";
import { getCachedIngredients } from "@/features/ingredients/actions/readIngredients";
import { PhotoToRecipe } from "@/features/recipes/components/PhotoToRecipe";
import { authOrForbidden } from "@/utils/auth";

export default async function PhotoToRecipePage() {
	const { orgId } = await authOrForbidden();
	const ingredients = await getCachedIngredients(orgId);

	return <PhotoToRecipe ingredients={ingredients} />;
}

export const metadata: Metadata = {
	title: "Photo to Recipe",
};
