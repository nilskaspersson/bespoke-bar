import { authOrForbidden } from "@bespoke/api/auth";
import { parsePhotoWithQuota } from "@bespoke/api/recipes/photo/parsePhotoWithQuota.service";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const { orgId, userId } = await authOrForbidden();

	const formData = await req.formData();

	const { status, body } = await parsePhotoWithQuota(
		{ orgId, userId },
		formData,
	);

	return Response.json(body, { status });
}
