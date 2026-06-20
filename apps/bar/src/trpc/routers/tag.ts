import { z } from "zod";
import { insertTagSchema } from "@/db/schema/tags";
import { createTag } from "@/features/tags/api/createTag.service";
import { getCachedTags } from "@/features/tags/api/listTags";
import { setRecipeTags } from "@/features/tags/api/setRecipeTags.service";
import { protectedProcedure, router } from "@/trpc";

export const tagRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedTags(ctx.orgId);
	}),

	create: protectedProcedure
		.input(insertTagSchema.pick({ name: true }))
		.mutation(({ ctx, input }) => {
			return createTag(ctx, input);
		}),

	setRecipeTags: protectedProcedure
		.input(
			z.object({
				recipeId: z.string(),
				tagIds: z.array(z.string()),
			}),
		)
		.mutation(({ ctx, input }) => {
			return setRecipeTags(ctx, input.recipeId, input.tagIds);
		}),
});
