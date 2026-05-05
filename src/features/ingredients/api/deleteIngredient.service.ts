import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { IngredientsTable } from "@/db/schema/ingredients";
import { rateLimit } from "@/rateLimit";
import type { Auth } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteIngredient(auth: Auth, id: string): Promise<void> {
	const { userId, orgId } = auth;

	await rateLimit(userId);

	await db
		.delete(IngredientsTable)
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)));

	cacheEvents.ingredient.delete.emit(orgId, id);
}
