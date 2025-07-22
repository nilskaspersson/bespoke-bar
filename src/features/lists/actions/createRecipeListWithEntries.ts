"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
	type RecipeListWithEntriesFormData,
	recipeListWithEntriesFormSchema,
} from "@/db/schema/composite";
import {
	type InsertRecipeListEntry,
	insertRecipeListEntrySchema,
	RecipeListEntriesTable,
} from "@/db/schema/recipeListEntries";
import {
	insertRecipeListSchema,
	type RecipeList,
	RecipeListsTable,
} from "@/db/schema/recipeLists";
import {
	generateDefaultRecipeListName,
	getRecipeListUrl,
} from "@/features/lists/utils";
import { authOrForbidden } from "@/utils/auth";

export async function createRecipeListWithEntries(
	userInputList: RecipeListWithEntriesFormData,
): Promise<RecipeList> {
	const { userId, orgId } = await authOrForbidden();

	/**
	 * Use a timestamp as a fallback name
	 * TODO: Move to implementation point for local formatting + schema validation?
	 */
	const name = userInputList.recipeList.name || generateDefaultRecipeListName();

	const result = await db.transaction(async (tx) => {
		const validatedList = insertRecipeListSchema.parse({
			...userInputList.recipeList,
			name,
			orgId,
			createdBy: userId,
		});

		const [list] = await tx
			.insert(RecipeListsTable)
			.values(validatedList)
			.returning();

		if (userInputList.entries) {
			const entriesToInsert: InsertRecipeListEntry[] =
				userInputList.entries.map((entry, index) => ({
					addedBy: userId,
					listId: list.id,
					recipeId: entry.recipeId,
					price: entry.price,
					sortOrder: entry.sortOrder ?? index,
				}));

			const validatedEntries = insertRecipeListEntrySchema
				.array()
				.parse(entriesToInsert);

			await tx.insert(RecipeListEntriesTable).values(validatedEntries);
		}

		return list;
	});

	return result;
}

export async function createRecipeListWithEntriesAction(
	_prevState: unknown,
	formData: FormData,
) {
	const submission = parseWithZod(formData, {
		schema: recipeListWithEntriesFormSchema,
	});

	if (submission.status !== "success") {
		return submission.reply();
	}

	let result: RecipeList;

	try {
		result = await createRecipeListWithEntries(submission.value);
	} catch (_error) {
		return submission.reply({
			formErrors: ["Failed to create list"],
		});
	}

	redirect(getRecipeListUrl(result));
}
