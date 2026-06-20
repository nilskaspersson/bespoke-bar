"use server";

import { z } from "zod";
import { revokeOrgProManual } from "@/features/admin/api/setOrgProManual.service";
import { adminOrForbidden } from "@/utils/admin";

const inputSchema = z.object({
	orgId: z.string().min(1),
});

export async function revokeProManual(input: unknown): Promise<void> {
	await adminOrForbidden();

	const { orgId } = inputSchema.parse(input);

	await revokeOrgProManual({ orgId });
}
