"use server";

import { z } from "zod";
import { issueOCRQuotaGrant } from "@/features/billing/api/issueOCRQuotaGrant.service";
import { adminOrForbidden } from "@/utils/admin";

const inputSchema = z.object({
	orgId: z.string().min(1),
	amount: z.coerce
		.number()
		.int()
		.refine((n) => n !== 0, {
			message: "Amount must be non-zero",
		}),
	source: z.enum(["manual", "refund"]).default("manual"),
	note: z.string().max(1000).optional(),
});

export async function grantOCRQuotaManual(input: unknown): Promise<void> {
	const { userId } = await adminOrForbidden();

	const { orgId, amount, source, note } = inputSchema.parse(input);

	await issueOCRQuotaGrant({
		orgId,
		amount,
		source,
		note,
		createdBy: userId,
	});
}
