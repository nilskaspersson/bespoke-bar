import { db } from "@/db";
import type { MenuWithEntriesFormData } from "@/db/schema/composite";
import type { Menu } from "@/db/schema/menus";
import {
	replaceMenuEntriesInTransaction,
	upsertMenuInTransaction,
} from "@/features/menus/api/utils/transactionHelpers";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function upsertMenuWithEntries(
	auth: Auth,
	userInputMenu: MenuWithEntriesFormData,
): Promise<Menu> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	const [result, isNew] = await db.transaction(async (tx) => {
		const [menu, isNew] = await upsertMenuInTransaction(
			tx,
			userInputMenu.menu,
			userId,
			orgId,
		);

		await replaceMenuEntriesInTransaction(
			tx,
			menu.id,
			userInputMenu.entries,
			orgId,
		);

		return [menu, isNew];
	});

	if (isNew) {
		cacheEvents.menu.create.emit(orgId);
	} else {
		cacheEvents.menu.update.emit(orgId, result.id);
	}

	return result;
}
