import { getCachedRecipeList } from "@/features/lists/api/readRecipeList";
import { authOrForbidden } from "@/utils/auth";

type RouteParams = {
	params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: RouteParams) {
	const { orgId } = await authOrForbidden();
	const { id } = await params;

	const list = await getCachedRecipeList(orgId, id);

	if (!list) {
		return Response.json({ error: "List not found" }, { status: 404 });
	}

	return Response.json(list);
}
