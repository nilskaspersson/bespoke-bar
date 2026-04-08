import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { parseTextFromImageService } from "@/features/recipes/photo/api/parseTextFromImage.service";

export async function POST(req: NextRequest) {
	const { userId } = await getAuth(req);

	if (!userId) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await req.formData();

	try {
		const result = await parseTextFromImageService(formData);
		return Response.json(result);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to parse image";
		return Response.json({ error: message }, { status: 400 });
	}
}
