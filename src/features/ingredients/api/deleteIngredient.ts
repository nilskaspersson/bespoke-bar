"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import { authOrForbidden } from "@/utils/auth";
import { cacheEvents } from "@/utils/cache";

export async function deleteIngredient({
	id,
	redirectTo,
}: {
	id: Ingredient["id"];
	redirectTo?: string;
}): Promise<void> {
	const { orgId } = await authOrForbidden();

	await db
		.delete(IngredientsTable)
		.where(and(eq(IngredientsTable.id, id), eq(IngredientsTable.orgId, orgId)));

	cacheEvents.ingredient.delete.emit(orgId, id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
