"use server";

import { adminOrForbidden } from "@bespoke/api/admin";
import { setOrgProManual } from "@bespoke/api/admin/setOrgProManual.service";
import { z } from "zod";

const inputSchema = z.object({
	orgId: z.string().min(1),
	expiresAt: z.coerce.date(),
});

export async function grantProManual(input: unknown): Promise<void> {
	const { userId } = await adminOrForbidden();

	const { orgId, expiresAt } = inputSchema.parse(input);

	await setOrgProManual({ orgId, expiresAt, createdBy: userId });
}
