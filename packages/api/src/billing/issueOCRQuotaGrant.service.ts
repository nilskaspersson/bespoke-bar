import { db } from "@bespoke/db";
import { isUniqueConstraintViolation } from "@bespoke/db/utils";
import {
	type OCRQuotaGrant,
	OCRQuotaGrantsTable,
} from "@bespoke/schema/schema/ocrQuotaGrants";
import { cacheEvents } from "../cache";

type IssueOCRQuotaGrantInput = {
	orgId: string;
	amount: number;
	source: OCRQuotaGrant["source"];
	externalId?: string;
	note?: string;
	createdBy?: string;
};

/**
 * Canonical writer for `ocr_quota_grants`. Idempotent on `externalId`: a
 * duplicate insert with the same key is swallowed, so at-least-once delivery
 * (Stripe webhooks, referral/activity jobs) can't double-grant.
 */
export async function issueOCRQuotaGrant(
	input: IssueOCRQuotaGrantInput,
): Promise<void> {
	try {
		await db.insert(OCRQuotaGrantsTable).values({
			orgId: input.orgId,
			amount: input.amount,
			source: input.source,
			externalId: input.externalId,
			note: input.note,
			createdBy: input.createdBy,
		});
	} catch (error) {
		if (isUniqueConstraintViolation(error, "ocr_quota_grants_external_id_uq")) {
			return;
		}
		throw error;
	}

	cacheEvents.ocrQuotaGrant.create.emit(input.orgId);
}
