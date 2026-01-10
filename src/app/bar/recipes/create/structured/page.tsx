import type { Metadata } from "next";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { RecipeForm } from "@/features/recipes/components/RecipeForm";
import { authOrForbidden } from "@/utils/auth";

export default async function CreateRecipePage() {
	const { orgId } = await authOrForbidden();
	const ingredients = await getCachedIngredients(orgId);

	return <RecipeForm ingredients={ingredients} />;
}

export const metadata: Metadata = {
	title: "Create Recipe",
};
