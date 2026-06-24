ALTER TABLE "recipe_favorites" DROP CONSTRAINT "recipe_favorites_user_recipe_unique";--> statement-breakpoint
DROP INDEX "idx_recipe_favorites_user_org";--> statement-breakpoint
DROP INDEX "idx_recipe_list_entries_org_list";--> statement-breakpoint
DROP INDEX "idx_recipes_org_id";--> statement-breakpoint
DROP INDEX "unique_list_name_case_insensitive";--> statement-breakpoint
CREATE INDEX "idx_recipe_list_entries_org" ON "recipe_list_entries" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_lists_org_activity" ON "recipe_lists" USING btree ("org_id",COALESCE("updated_at", "created_at") DESC);--> statement-breakpoint
CREATE INDEX "idx_recipes_org_created" ON "recipes" USING btree ("org_id","created_at" DESC);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_list_name_case_insensitive" ON "recipe_lists" USING btree ("org_id",lower(trim("name")));--> statement-breakpoint
ALTER TABLE "recipe_favorites" DROP COLUMN "id";