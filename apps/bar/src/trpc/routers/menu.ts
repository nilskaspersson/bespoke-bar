import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@bespoke/domain/ingredientLines/stitchIngredients";
import { menuWithEntriesFormSchema } from "@bespoke/schema/schema/composite";
import { menuFormSchema } from "@bespoke/schema/schema/menus";
import { z } from "zod";
import { getCachedIngredients } from "@/features/ingredients/api/readIngredients";
import { createMenu } from "@/features/menus/api/createMenu.service";
import { deleteMenu } from "@/features/menus/api/deleteMenu.service";
import { getCachedMenus } from "@/features/menus/api/readBarMenus";
import { getCachedMenu } from "@/features/menus/api/readMenu";
import { upsertMenuWithEntries } from "@/features/menus/api/upsertMenuWithEntries.service";
import { protectedProcedure, router } from "@/trpc";

export const menuRouter = router({
	list: protectedProcedure.query(({ ctx }) => {
		return getCachedMenus(ctx.orgId);
	}),

	byId: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [rawMenu, ingredients] = await Promise.all([
				getCachedMenu(ctx.orgId, input.id),
				getCachedIngredients(ctx.orgId),
			]);
			if (!rawMenu) return rawMenu;
			return stitchMenuEntries(rawMenu, buildIngredientMap(ingredients));
		}),

	create: protectedProcedure
		.input(menuFormSchema)
		.mutation(({ ctx, input }) => {
			return createMenu(ctx, input);
		}),

	upsertWithEntries: protectedProcedure
		.input(menuWithEntriesFormSchema)
		.mutation(({ ctx, input }) => {
			return upsertMenuWithEntries(ctx, input);
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return deleteMenu(ctx, input.id);
		}),
});
