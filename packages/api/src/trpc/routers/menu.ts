import {
	buildIngredientMap,
	stitchMenuEntries,
} from "@bespoke/domain/ingredientLines/stitchIngredients";
import { menuWithEntriesFormSchema } from "@bespoke/schema/schema/composite";
import { menuFormSchema } from "@bespoke/schema/schema/menus";
import { z } from "zod";
import { getCachedIngredients } from "../../ingredients/readIngredients";
import { createMenu } from "../../menus/createMenu.service";
import { deleteMenu } from "../../menus/deleteMenu.service";
import { getCachedMenus } from "../../menus/readBarMenus";
import { getCachedMenu } from "../../menus/readMenu";
import { upsertMenuWithEntries } from "../../menus/upsertMenuWithEntries.service";
import { protectedProcedure, router } from "../index";

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
			if (!rawMenu) return null;
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
