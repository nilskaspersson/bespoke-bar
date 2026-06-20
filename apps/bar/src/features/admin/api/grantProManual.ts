"use server";

import { z } from "zod";
import { setOrgProManual } from "@/features/admin/api/setOrgProManual.service";
import { adminOrForbidden } from "@/utils/admin";

const inputSchema = z.object({
	orgId: z.string().min(1),
	expiresAt: z.coerce.date(),
});

export async function grantProManual(input: unknown): Promise<void> {
	const { userId } = await adminOrForbidden();

	const { orgId, expiresAt } = inputSchema.parse(input);

	await setOrgProManual({ orgId, expiresAt, createdBy: userId });
}
