import { openHandoff } from "@bespoke/api/recipes/photo/handoff/handoff.service";
import type { NextRequest } from "next/server";

export async function POST(
	_req: NextRequest,
	{ params }: { params: Promise<{ nonce: string }> },
) {
	const { nonce } = await params;

	const result = await openHandoff(nonce);

	if (result.ok) {
		return Response.json({ ok: true });
	}

	return Response.json({ ok: false, reason: result.reason }, { status: 410 });
}
