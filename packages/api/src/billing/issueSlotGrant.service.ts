import { db } from "@bespoke/db";
import { isUniqueConstraintViolation } from "@bespoke/db/utils";
import {
	type RecipeSlotGrant,
	RecipeSlotGrantsTable,
} from "@bespoke/schema/schema/recipeSlotGrants";
import { eq } from "drizzle-orm";
import { cacheEvents } from "../cache";

type IssueSlotGrantInput = {
	orgId: string;
	amount: number;
	source: RecipeSlotGrant["source"];
	externalId?: string;
	note?: string;
	createdBy?: string;
	/**
	 * Route Handlers (f.e. Stripe webhook) must emit cache invalidation via `revalidateTag`
	 */
	fromRouteHandler?: boolean;
};

export async function issueSlotGrant(
	input: IssueSlotGrantInput,
): Promise<void> {
	try {
		await db.insert(RecipeSlotGrantsTable).values({
			orgId: input.orgId,
			amount: input.amount,
			source: input.source,
			externalId: input.externalId,
			note: input.note,
			createdBy: input.createdBy,
		});
	} catch (error) {
		if (
			isUniqueConstraintViolation(error, "recipe_slot_grants_external_id_uq")
		) {
			return;
		}
		throw error;
	}

	if (input.fromRouteHandler) {
		cacheEvents.recipeSlotGrant.create.emitFromRouteHandler(input.orgId);
	} else {
		cacheEvents.recipeSlotGrant.create.emit(input.orgId);
	}
}

/**
 * Compensating entry for a refunded purchase or signup bonus: negates the
 * original grant, keyed `refund:<originalGrantId>` so a redelivered refund
 * event can't double-claw. The ledger stays append-only.
 */
export async function clawBackSlotGrant(input: {
	originalExternalId: string;
	note: string;
	fromRouteHandler?: boolean;
}): Promise<void> {
	const [original] = await db
		.select({
			id: RecipeSlotGrantsTable.id,
			orgId: RecipeSlotGrantsTable.orgId,
			amount: RecipeSlotGrantsTable.amount,
		})
		.from(RecipeSlotGrantsTable)
		.where(eq(RecipeSlotGrantsTable.externalId, input.originalExternalId))
		.limit(1);

	if (!original || original.amount <= 0) {
		return;
	}

	await issueSlotGrant({
		orgId: original.orgId,
		amount: -original.amount,
		source: "refund",
		externalId: `refund:${original.id}`,
		note: input.note,
		fromRouteHandler: input.fromRouteHandler,
	});
}
