import type { Metadata } from "next";
import { readOrganisationMembers } from "@/features/organisation/actions/readOrganisationMembers";
import { getCachedArchivedBarRecipes } from "@/features/recipes/actions/readArchivedBarRecipes";
import { RecipeTable } from "@/features/recipes/components/RecipeTable";
import { authOrForbidden } from "@/utils/auth";

export default async function ArchivedRecipesPage() {
	const { orgId } = await authOrForbidden();

	const [archivedRecipes, members] = await Promise.all([
		getCachedArchivedBarRecipes(orgId),
		readOrganisationMembers(),
	]);

	return <RecipeTable recipes={archivedRecipes} members={members} />;
}

export const metadata: Metadata = {
	title: "Archive",
};
