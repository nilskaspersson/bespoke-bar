import { db } from "@/db";
import {
	type RecipeSlotGrant,
	RecipeSlotGrantsTable,
} from "@/db/schema/recipeSlotGrants";
import { isUniqueConstraintViolation } from "@/db/utils";
import { cacheEvents } from "@/utils/cache";

type IssueSlotGrantInput = {
	orgId: string;
	amount: number;
	source: RecipeSlotGrant["source"];
	externalId?: string;
	note?: string;
	createdBy?: string;
};

/**
 * Canonical writer for `recipe_slot_grants`.
 */
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

	cacheEvents.recipeSlotGrant.create.emit(input.orgId);
}
