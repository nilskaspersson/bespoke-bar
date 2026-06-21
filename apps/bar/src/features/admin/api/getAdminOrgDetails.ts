import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import {
	isProActive,
	type SubscriptionAttention,
	type SubscriptionStatus,
	subscriptionAttention,
} from "@bespoke/schema/schema/orgSubscriptions";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
	listOrgMembers,
	type OrgMemberSummary,
} from "@/features/admin/api/listOrgMembers";
import {
	getCachedOCRQuotaState,
	type OCRQuotaState,
} from "@/features/billing/api/getOCRQuotaState";
import { getCachedOrgSubscription } from "@/features/billing/api/getOrgSubscription";
import {
	getCachedRecipeSlotUsage,
	type RecipeSlotUsage,
} from "@/features/billing/api/getRecipeSlotUsage";

export type AdminSubscriptionSummary = {
	status: SubscriptionStatus;
	isPro: boolean;
	attention: SubscriptionAttention | null;
	currentPeriodEnd: string;
	cancelAtPeriodEnd: boolean;
};

export type AdminOrgDetails = {
	members: OrgMemberSummary[];
	ocrQuota: OCRQuotaState;
	slots: RecipeSlotUsage;
	subscription: AdminSubscriptionSummary | null;
};

export async function getAdminOrgDetails(
	localOrgId: string,
): Promise<AdminOrgDetails> {
	const id = z.string().min(1).parse(localOrgId);

	const [org] = await db
		.select({ clerkOrgId: OrganisationsTable.clerkOrgId })
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, id))
		.limit(1);

	const [members, ocrQuota, slots, sub] = await Promise.all([
		org ? listMembersSafe(org.clerkOrgId) : Promise.resolve([]),
		getCachedOCRQuotaState(id),
		getCachedRecipeSlotUsage(id),
		getCachedOrgSubscription(id),
	]);

	return {
		members,
		ocrQuota,
		slots,
		subscription: sub
			? {
					status: sub.status,
					isPro: isProActive(sub.status),
					attention: subscriptionAttention(sub.status),
					currentPeriodEnd: new Date(
						`${sub.currentPeriodEnd.replace(" ", "T")}Z`,
					).toISOString(),
					cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
				}
			: null,
	};
}

/** Orphaned orgs 404 in Clerk */
async function listMembersSafe(
	clerkOrgId: string,
): Promise<OrgMemberSummary[]> {
	try {
		return await listOrgMembers(clerkOrgId);
	} catch {
		return [];
	}
}
