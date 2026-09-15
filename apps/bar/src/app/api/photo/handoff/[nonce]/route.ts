import { submitHandoffPhoto } from "@bespoke/api/recipes/photo/handoff/submitHandoffPhoto.service";
import type { NextRequest } from "next/server";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ nonce: string }> },
) {
	const { nonce } = await params;

	const formData = await req.formData();

	const { status, body } = await submitHandoffPhoto(nonce, formData);

	return Response.json(body, { status });
}
