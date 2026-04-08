import { z } from "zod/v4";
import { recipeListWithEntriesFormSchema } from "@/db/schema/composite";
import { deleteRecipeList } from "@/features/lists/api/deleteRecipeList.service";
import { getCachedRecipeLists } from "@/features/lists/api/readBarRecipeLists";
import { getCachedRecipeList } from "@/features/lists/api/readRecipeList";
import { upsertRecipeListWithEntries } from "@/features/lists/api/upsertRecipeListWithEntries.service";
import { protectedProcedure, router } from "@/server/trpc";

export const recipeListRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedRecipeLists(ctx.orgId);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(({ ctx, input }) => {
			return getCachedRecipeList(ctx.orgId, input.id);
		}),

	upsertWithEntries: protectedProcedure
		.input(recipeListWithEntriesFormSchema)
		.mutation(({ ctx, input }) => {
			return upsertRecipeListWithEntries(ctx, input);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return deleteRecipeList(ctx, input.id);
		}),
});
