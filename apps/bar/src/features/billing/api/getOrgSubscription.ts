import { db } from "@bespoke/db";
import {
	type OrgSubscription,
	OrgSubscriptionsTable,
} from "@bespoke/schema/schema/orgSubscriptions";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { cacheTags } from "@/utils/cache";

/**
 * The entitlement gates read this directly rather than through the cache: Pro
 * bonuses must never be stored, so a cancellation propagates on the very next
 * gate check.
 */
export async function getOrgSubscription(
	orgId: string,
): Promise<OrgSubscription | null> {
	const [sub] = await db
		.select()
		.from(OrgSubscriptionsTable)
		.where(eq(OrgSubscriptionsTable.orgId, orgId))
		.limit(1);

	return sub ?? null;
}

export async function getCachedOrgSubscription(
	orgId: string,
): Promise<OrgSubscription | null> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.orgSubscription(orgId));
	return await getOrgSubscription(orgId);
}
