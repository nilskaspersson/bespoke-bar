import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import {
	deleteLocalOrganisation,
	InvalidClerkOrgIdError,
} from "@/features/organisation/api/deleteLocalOrganisation.service";

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
		try {
			const result = await deleteLocalOrganisation(event.data.id);
			console.info("organization.deleted processed", result);
		} catch (error) {
			if (error instanceof InvalidClerkOrgIdError) {
				console.error(
					"Refusing organization.deleted webhook with malformed id",
					{ id: event.data.id },
				);
				return new Response("Malformed event payload", { status: 400 });
			}
			throw error;
		}
	}

	return new Response("OK", { status: 200 });
}
