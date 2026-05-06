import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { OrganisationsTable } from "@/db/schema/organisations";

/**
 * Minimum sanity envelope for a Clerk org id.
 */
const CLERK_ORG_ID_PATTERN = /^org_[A-Za-z0-9]{8,}$/;

/**
 * Clerk webhook receiver. Subscribed events are configured in the Clerk
 * dashboard. Unhandled event types respond 200 so Clerk doesn't mark them as
 * failed and retry indefinitely.
 */
export async function POST(req: NextRequest) {
	let event: Awaited<ReturnType<typeof verifyWebhook>>;

	try {
		event = await verifyWebhook(req);
	} catch (error) {
		console.warn("Clerk webhook signature verification failed", error);
		return new Response("Invalid signature", { status: 401 });
	}

	if (event.type === "organization.deleted") {
		const clerkOrgId = event.data.id;

		/**
		 * We require a syntactically plausible Clerk org id so we can't somehow,
		 * accidentally, match a row whose `clerk_org_id` happens to be empty, nullish,
		 * or shaped by a different identifier scheme.
		 */
		if (
			typeof clerkOrgId !== "string" ||
			!CLERK_ORG_ID_PATTERN.test(clerkOrgId)
		) {
			console.error("Refusing organization.deleted webhook with malformed id", {
				id: clerkOrgId,
			});
			return new Response("Malformed event payload", { status: 400 });
		}

		/**
		 * FK ON DELETE CASCADE on every entity table cleans out all data for the org.
		 */
		const deleted = await db
			.delete(OrganisationsTable)
			.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
			.returning({ id: OrganisationsTable.id });

		if (deleted.length > 1) {
			console.error("organization.deleted cascade affected multiple rows", {
				clerkOrgId,
				deletedIds: deleted.map((row) => row.id),
			});
		} else {
			console.info("organization.deleted processed", {
				clerkOrgId,
				deletedId: deleted[0]?.id ?? null,
			});
		}
	}

	return new Response("OK", { status: 200 });
}
