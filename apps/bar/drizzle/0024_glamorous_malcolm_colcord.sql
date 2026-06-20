ALTER TABLE "recipe_list_entries" RENAME TO "menu_entries";--> statement-breakpoint
ALTER TABLE "recipe_lists" RENAME TO "menus";--> statement-breakpoint
ALTER TABLE "menu_entries" RENAME COLUMN "list_id" TO "menu_id";--> statement-breakpoint
ALTER TABLE "menu_entries" DROP CONSTRAINT "recipe_list_entries_org_id_organisations_id_fk";
--> statement-breakpoint
ALTER TABLE "menu_entries" DROP CONSTRAINT "recipe_list_entries_list_id_recipe_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "menu_entries" DROP CONSTRAINT "recipe_list_entries_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "menus" DROP CONSTRAINT "recipe_lists_org_id_organisations_id_fk";
--> statement-breakpoint
DROP INDEX "idx_recipe_list_entries_org";--> statement-breakpoint
DROP INDEX "idx_recipe_list_entries_unique";--> statement-breakpoint
DROP INDEX "idx_recipe_list_entries_list_order";--> statement-breakpoint
DROP INDEX "idx_recipe_list_entries_recipe";--> statement-breakpoint
DROP INDEX "unique_list_name_case_insensitive";--> statement-breakpoint
DROP INDEX "idx_lists_org_activity";--> statement-breakpoint
DROP INDEX "idx_lists_featured_org";--> statement-breakpoint
DROP INDEX "idx_lists_org_public";--> statement-breakpoint
ALTER TABLE "menu_entries" ADD CONSTRAINT "menu_entries_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_entries" ADD CONSTRAINT "menu_entries_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_entries" ADD CONSTRAINT "menu_entries_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menus" ADD CONSTRAINT "menus_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_menu_entries_org" ON "menu_entries" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_menu_entries_unique" ON "menu_entries" USING btree ("menu_id","recipe_id");--> statement-breakpoint
CREATE INDEX "idx_menu_entries_menu_order" ON "menu_entries" USING btree ("menu_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_menu_entries_recipe" ON "menu_entries" USING btree ("recipe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_menu_name_case_insensitive" ON "menus" USING btree ("org_id",lower(trim("name")));--> statement-breakpoint
CREATE INDEX "idx_menus_org_activity" ON "menus" USING btree ("org_id",COALESCE("updated_at", "created_at") DESC);--> statement-breakpoint
CREATE INDEX "idx_menus_featured_org" ON "menus" USING btree ("org_id","is_featured");--> statement-breakpoint
CREATE INDEX "idx_menus_org_public" ON "menus" USING btree ("org_id","is_public");