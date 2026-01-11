import { getCachedRecipeLists } from "@/features/lists/api/readBarRecipeLists";
import { authOrForbidden } from "@/utils/auth";

export async function GET() {
	try {
		const { orgId } = await authOrForbidden();
		const lists = await getCachedRecipeLists(orgId);
		return Response.json(lists);
	} catch (_e) {
		return Response.json({ error: "Failed to fetch lists" }, { status: 500 });
	}
}
