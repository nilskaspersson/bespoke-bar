DROP INDEX "idx_ingredients_org";--> statement-breakpoint
DROP INDEX "organisations_clerk_org_id_idx";--> statement-breakpoint
DROP INDEX "idx_recipe_list_entries_org";--> statement-breakpoint
DROP INDEX "idx_lists_org";--> statement-breakpoint
DROP INDEX "idx_recipes_org";--> statement-breakpoint
DROP INDEX "idx_recipes_org_archived_created";--> statement-breakpoint
DROP INDEX "idx_specs_recipe";--> statement-breakpoint
DROP INDEX "unique_ingredient_name_case_insensitive";--> statement-breakpoint
DROP INDEX "idx_recipe_favorites_user_org";--> statement-breakpoint
DROP INDEX "idx_lists_org_public";--> statement-breakpoint
CREATE INDEX "idx_recipes_org_archived" ON "recipes" USING btree ("org_id","archived_at");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ingredient_name_case_insensitive" ON "ingredients" USING btree ("org_id",lower(trim("name")));--> statement-breakpoint
CREATE INDEX "idx_recipe_favorites_user_org" ON "recipe_favorites" USING btree ("org_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_lists_org_public" ON "recipe_lists" USING btree ("org_id","is_public");