import { z } from "zod";
import { getCachedUserFavoriteRecipeIds } from "@/features/recipes/api/readUserFavoriteRecipeIds";
import { toggleRecipeFavorite } from "@/features/recipes/api/toggleRecipeFavorite.service";
import { protectedProcedure, router } from "@/trpc";

export const favoriteRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedUserFavoriteRecipeIds(ctx.orgId, ctx.userId);
	}),

	toggle: protectedProcedure
		.input(z.object({ recipeId: z.string() }))
		.mutation(({ ctx, input }) => {
			return toggleRecipeFavorite(ctx, input.recipeId);
		}),
});
