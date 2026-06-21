import { z } from "zod";
import { getCachedUserFavoriteRecipeIds } from "../../recipes/readUserFavoriteRecipeIds";
import { toggleRecipeFavorite } from "../../recipes/toggleRecipeFavorite.service";
import { protectedProcedure, router } from "../index";

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
