import { z } from "zod";
import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@/features/ingredientLines/utils/stitchIngredients";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { clearFeaturedMenu } from "@/features/menus/featured/api/clearFeaturedMenu.service";
import { getCachedFeaturedMenu } from "@/features/menus/featured/api/readFeaturedMenu";
import { setFeaturedMenu } from "@/features/menus/featured/api/setFeaturedMenu.service";
import { protectedProcedure, router } from "@/trpc";

export const featuredRouter = router({
	get: protectedProcedure.query(async ({ ctx }) => {
		const [rawMenu, ingredients] = await Promise.all([
			getCachedFeaturedMenu(ctx.orgId),
			getCachedIngredients(ctx.orgId),
		]);
		if (!rawMenu) return rawMenu;
		return stitchMenuEntries(rawMenu, buildIngredientMap(ingredients));
	}),

	set: protectedProcedure
		.input(z.object({ menuId: z.string() }))
		.mutation(({ ctx, input }) => {
			return setFeaturedMenu(ctx, input.menuId);
		}),

	clear: protectedProcedure.mutation(({ ctx }) => {
		return clearFeaturedMenu(ctx);
	}),
});
