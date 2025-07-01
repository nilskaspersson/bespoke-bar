import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { readArchivedBarRecipes } from "@/features/recipes/actions/readArchivedBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";

export default async function ArchivedRecipesPage() {
	const [archivedRecipes, members] = await Promise.all([
		readArchivedBarRecipes(),
		readOrganisationMembers(),
	]);

	return <RecipeTable recipes={archivedRecipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Archive",
};
