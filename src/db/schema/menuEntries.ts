import { relations } from "drizzle-orm";
import {
	index,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import type {
	IngredientLine,
	IngredientLineWithIngredient,
} from "@/db/schema/ingredientLines";
import { MenusTable } from "@/db/schema/menus";
import { OrganisationsTable } from "@/db/schema/organisations";
import { RecipesTable, type RecipeWithLines } from "@/db/schema/recipes";

export const MenuEntriesTable = pgTable(
	"menu_entries",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid(10)),
		orgId: text("org_id")
			.notNull()
			.references(() => OrganisationsTable.id, { onDelete: "cascade" }),
		menuId: text("menu_id")
			.notNull()
			.references(() => MenusTable.id, { onDelete: "cascade" }),
		recipeId: text("recipe_id")
			.notNull()
			.references(() => RecipesTable.id, { onDelete: "cascade" }),
		sortOrder: integer("sort_order"),
		price: numeric("price", { precision: 12, scale: 4, mode: "number" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }),
	},
	(table) => [
		index("idx_menu_entries_org").on(table.orgId),
		// A recipe can only appear once per menu
		uniqueIndex("idx_menu_entries_unique").on(table.menuId, table.recipeId),
		// All entries in a menu
		index("idx_menu_entries_menu_order").on(table.menuId, table.sortOrder),
		// All menus a recipe belongs to
		index("idx_menu_entries_recipe").on(table.recipeId),
	],
);

export const menuEntriesRelations = relations(MenuEntriesTable, ({ one }) => ({
	menu: one(MenusTable, {
		fields: [MenuEntriesTable.menuId],
		references: [MenusTable.id],
	}),
	recipe: one(RecipesTable, {
		fields: [MenuEntriesTable.recipeId],
		references: [RecipesTable.id],
	}),
}));

export type MenuEntry = typeof MenuEntriesTable.$inferSelect;

export type InsertMenuEntry = Omit<typeof MenuEntriesTable.$inferInsert, "id">;

export type UpdateMenuEntry = Pick<
	typeof MenuEntriesTable.$inferInsert,
	"sortOrder" | "price" | "recipeId" | "menuId"
>;

export type MenuEntryWithRecipe<
	S extends IngredientLine = IngredientLineWithIngredient,
> = MenuEntry & {
	recipe: RecipeWithLines<S>;
};

export const selectMenuEntrySchema = createSelectSchema(MenuEntriesTable);

export const insertMenuEntrySchema = createInsertSchema(MenuEntriesTable);

export const updateMenuEntrySchema = createUpdateSchema(MenuEntriesTable);

export const menuEntryFormSchema = insertMenuEntrySchema
	.pick({
		price: true,
		menuId: true,
		recipeId: true,
		sortOrder: true,
	})
	.extend({
		menuId: z.string({ message: "Select a menu" }),
	})
	.partial({
		price: true,
		sortOrder: true,
	});

export type MenuEntryFormData = z.infer<typeof menuEntryFormSchema>;
