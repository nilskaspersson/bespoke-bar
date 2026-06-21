import { menuWithEntriesFormSchema } from "@bespoke/schema/schema/composite";
import { menuEntryFormSchema } from "@bespoke/schema/schema/menuEntries";
import { z } from "zod";
import { addRecipeToMenu } from "@/features/menus/entries/api/addRecipeToMenu.service";
import { appendMenuEntry } from "@/features/menus/entries/api/appendMenuEntry.service";
import { removeRecipeFromMenu } from "@/features/menus/entries/api/removeRecipeFromMenu.service";
import { updateMenuEntry } from "@/features/menus/entries/api/updateMenuEntry.service";
import { protectedProcedure, router } from "@/trpc";

export const menuEntryRouter = router({
	add: protectedProcedure
		.input(menuEntryFormSchema)
		.mutation(({ ctx, input }) => {
			return addRecipeToMenu(ctx, input);
		}),

	remove: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(({ ctx, input }) => {
			return removeRecipeFromMenu(ctx, input.id);
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: menuEntryFormSchema,
			}),
		)
		.mutation(({ ctx, input }) => {
			return updateMenuEntry(ctx, input.id, input.data);
		}),

	append: protectedProcedure
		.input(menuWithEntriesFormSchema)
		.mutation(({ ctx, input }) => {
			return appendMenuEntry(ctx, input);
		}),
});
