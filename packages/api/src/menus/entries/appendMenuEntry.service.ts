import { db } from "@bespoke/db";
import type {
	MenuWithEntries,
	MenuWithEntriesFormData,
} from "@bespoke/schema/schema/composite";
import type { Auth } from "../../auth";
import { cacheEvents } from "../../cache";
import { rateLimit } from "../../rateLimit";
import {
	appendMenuEntriesInTransaction,
	upsertMenuInTransaction,
} from "../utils/transactionHelpers";

export async function appendMenuEntry(
	auth: Auth,
	userInputMenu: MenuWithEntriesFormData,
): Promise<MenuWithEntries> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const [result, isNew] = await db.transaction(async (tx) => {
		const [menu, isNew] = await upsertMenuInTransaction(
			tx,
			userInputMenu.menu,
			userId,
			orgId,
		);

		const entries = await appendMenuEntriesInTransaction(
			tx,
			menu.id,
			userInputMenu.entries,
			orgId,
		);

		return [{ ...menu, entries }, isNew];
	});

	if (isNew) {
		cacheEvents.menu.create.emit(orgId);
	} else {
		cacheEvents.menu.update.emit(orgId, result.id);
	}

	return result;
}
