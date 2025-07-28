ALTER TABLE "recipe_list_entries" ALTER COLUMN "sort_order" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_list_entries" ADD COLUMN "org_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_recipe_list_entries_org" ON "recipe_list_entries" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_list_entries_org_list" ON "recipe_list_entries" USING btree ("org_id","list_id");