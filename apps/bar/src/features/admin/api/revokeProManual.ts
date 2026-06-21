"use server";

import { adminOrForbidden } from "@bespoke/api/admin";
import { revokeOrgProManual } from "@bespoke/api/admin/setOrgProManual.service";
import { z } from "zod";

const inputSchema = z.object({
	orgId: z.string().min(1),
});

export async function revokeProManual(input: unknown): Promise<void> {
	await adminOrForbidden();

	const { orgId } = inputSchema.parse(input);

	await revokeOrgProManual({ orgId });
}
