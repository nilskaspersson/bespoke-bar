import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { readBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";

export default async function RecipesPage() {
	const [recipes, members] = await Promise.all([
		readBarRecipes(),
		readOrganisationMembers(),
	]);

	return <RecipeTable recipes={recipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Recipes",
};
