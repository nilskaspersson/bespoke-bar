import { insertTagSchema } from "@bespoke/schema/schema/tags";
import { z } from "zod";
import { createTag } from "../../tags/createTag.service";
import { getCachedTags } from "../../tags/listTags";
import { setRecipeTags } from "../../tags/setRecipeTags.service";
import { protectedProcedure, router } from "../index";

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
