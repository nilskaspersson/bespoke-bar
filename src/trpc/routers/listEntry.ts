import { z } from "zod";
import { recipeListWithEntriesFormSchema } from "@/db/schema/composite";
import { recipeListEntryFormSchema } from "@/db/schema/recipeListEntries";
import { addRecipeToList } from "@/features/lists/entries/api/addRecipeToList.service";
import { appendRecipeListEntry } from "@/features/lists/entries/api/appendRecipeListEntry.service";
import { removeRecipeFromList } from "@/features/lists/entries/api/removeRecipeFromList.service";
import { updateRecipeListEntry } from "@/features/lists/entries/api/updateRecipeListEntry.service";
import { protectedProcedure, router } from "@/trpc";

export const listEntryRouter = router({
	add: protectedProcedure
		.input(recipeListEntryFormSchema)
		.mutation(({ ctx, input }) => {
			return addRecipeToList(ctx, input);
		}),

	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return removeRecipeFromList(ctx, input.id);
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: recipeListEntryFormSchema,
			}),
		)
		.mutation(({ ctx, input }) => {
			return updateRecipeListEntry(ctx, input.id, input.data);
		}),

	append: protectedProcedure
		.input(recipeListWithEntriesFormSchema)
		.mutation(({ ctx, input }) => {
			return appendRecipeListEntry(ctx, input);
		}),
});
