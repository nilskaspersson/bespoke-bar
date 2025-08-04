import type { Metadata } from "next";
import { Suspense } from "react";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { getCachedBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";
import { authOrForbidden } from "@/utils/auth";

export default async function RecipesPage() {
	return (
		<Suspense fallback={<div>Loading recipes...</div>}>
			<RecipeTableWithData />
		</Suspense>
	);
}

async function RecipeTableWithData() {
	const { orgId } = await authOrForbidden();

	const [recipes, members] = await Promise.all([
		getCachedBarRecipes(orgId),
		readOrganisationMembers(),
	]);

	return <RecipeTable recipes={recipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Recipes",
};
