import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@bespoke/domain/ingredientLines/stitchIngredients";
import { z } from "zod";
import { getCachedIngredients } from "../../ingredients/readIngredients";
import { clearFeaturedMenu } from "../../menus/featured/clearFeaturedMenu.service";
import { getCachedFeaturedMenu } from "../../menus/featured/readFeaturedMenu";
import { setFeaturedMenu } from "../../menus/featured/setFeaturedMenu.service";
import { protectedProcedure, router } from "../index";

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
