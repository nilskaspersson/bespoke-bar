import { z } from "zod";
import { insertTagSchema } from "@/db/schema/tags";
import { createTag } from "@/features/tags/api/createTag.service";
import { deleteTag } from "@/features/tags/api/deleteTag.service";
import { getCachedTags } from "@/features/tags/api/listTags";
import { setRecipeTags } from "@/features/tags/api/setRecipeTags.service";
import { updateTag } from "@/features/tags/api/updateTag.service";
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

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: insertTagSchema.pick({ name: true }),
			}),
		)
		.mutation(({ ctx, input }) => {
			return updateTag(ctx, input.id, input.data);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return deleteTag(ctx, input.id);
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
