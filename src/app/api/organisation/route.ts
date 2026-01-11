import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { authOrForbidden } from "@/utils/auth";

export async function GET() {
	try {
		const { orgId, userId } = await authOrForbidden();
		const organisation = await getOrCreateLocalOrganisation(orgId, userId);
		return Response.json(organisation);
	} catch (_e) {
		return Response.json(
			{ error: "Failed to fetch organisation" },
			{ status: 500 },
		);
	}
}
