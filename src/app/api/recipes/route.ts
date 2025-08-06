import { getCachedBarRecipes } from "@/features/recipes/actions/readBarRecipes";
import { authOrForbidden } from "@/utils/auth";

export async function GET() {
	try {
		const { orgId } = await authOrForbidden();
		const lists = await getCachedBarRecipes(orgId);
		return Response.json(lists);
	} catch (_e) {
		return Response.json({ error: "Failed to fetch recipes" }, { status: 500 });
	}
}
