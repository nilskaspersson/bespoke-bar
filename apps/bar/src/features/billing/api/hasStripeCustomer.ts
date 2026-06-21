import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { cacheTags } from "@/utils/cache";

export async function hasStripeCustomer(orgId: string): Promise<boolean> {
	"use cache";
	cacheLife("max");
	cacheTag(...cacheTags.organisation(orgId));

	const [org] = await db
		.select({ stripeCustomerId: OrganisationsTable.stripeCustomerId })
		.from(OrganisationsTable)
		.where(eq(OrganisationsTable.id, orgId));

	return Boolean(org?.stripeCustomerId);
}
