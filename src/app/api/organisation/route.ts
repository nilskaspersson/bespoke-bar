import { getOrCreateLocalOrganisation } from "@/features/organisation/actions/getOrCreateLocalOrganisation";

export async function GET() {
	try {
		const organisation = await getOrCreateLocalOrganisation();
		return Response.json(organisation);
	} catch (_e) {
		return Response.json(
			{ error: "Failed to fetch organisation" },
			{ status: 500 },
		);
	}
}
