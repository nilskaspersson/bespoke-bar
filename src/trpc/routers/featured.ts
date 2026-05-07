import { z } from "zod";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { clearFeaturedList } from "@/features/lists/featured/api/clearFeaturedList.service";
import { getCachedFeaturedList } from "@/features/lists/featured/api/readFeaturedList";
import { setFeaturedList } from "@/features/lists/featured/api/setFeaturedList.service";
import {
	buildIngredientMap,
	stitchRecipeListEntries,
} from "@/features/specs/utils/stitchIngredients";
import { protectedProcedure, router } from "@/trpc";

export const featuredRouter = router({
	get: protectedProcedure.query(async ({ ctx }) => {
		const [rawList, ingredients] = await Promise.all([
			getCachedFeaturedList(ctx.orgId),
			getCachedIngredients(ctx.orgId),
		]);
		if (!rawList) return rawList;
		return stitchRecipeListEntries(rawList, buildIngredientMap(ingredients));
	}),

	set: protectedProcedure
		.input(z.object({ listId: z.string() }))
		.mutation(({ ctx, input }) => {
			return setFeaturedList(ctx, input.listId);
		}),

	clear: protectedProcedure.mutation(({ ctx }) => {
		return clearFeaturedList(ctx);
	}),
});
