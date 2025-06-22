"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { type Ingredient, IngredientsTable } from "@/db/schema/ingredients";
import { revalidateIngredientPaths } from "@/features/ingredients/utils/server";
import { authOrForbidden } from "@/utils/auth";

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

	revalidateIngredientPaths(id);

	if (redirectTo) {
		redirect(redirectTo);
	}
}
