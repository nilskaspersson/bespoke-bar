import { deleteLocalOrganisation } from "@bespoke/api/organisation/deleteLocalOrganisation.service";
import { db } from "@bespoke/db";
import { OrganisationsTable } from "@bespoke/schema/schema/organisations";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

const CLERK_ORG_ID_PATTERN = /^org_[A-Za-z0-9]{8,}$/;

/**
 * Clerk webhook receiver. Subscribed events are configured in the Clerk
 * dashboard. Unhandled event types respond 200 so Clerk doesn't mark them
 * as failed and retry indefinitely.
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

		if (
			typeof clerkOrgId !== "string" ||
			!CLERK_ORG_ID_PATTERN.test(clerkOrgId)
		) {
			console.error("Refusing organization.deleted webhook with malformed id", {
				id: clerkOrgId,
			});
			return new Response("Malformed event payload", { status: 400 });
		}

		const [row] = await db
			.select({ id: OrganisationsTable.id })
			.from(OrganisationsTable)
			.where(eq(OrganisationsTable.clerkOrgId, clerkOrgId))
			.limit(1);

		if (row) {
			const result = await deleteLocalOrganisation(row.id);
			console.info("organization.deleted processed", result);
		}
	}

	return new Response("OK", { status: 200 });
}
