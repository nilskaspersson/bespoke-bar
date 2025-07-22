CREATE TABLE "recipe_list_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"sort_order" integer NOT NULL,
	"price" real
);
--> statement-breakpoint
CREATE TABLE "recipe_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(1000),
	"is_public" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp,
	"updated_by" text,
	"featured_at" timestamp,
	"org_id" text NOT NULL
);
--> statement-breakpoint
DROP INDEX "unique_name_case_insensitive";--> statement-breakpoint
ALTER TABLE "recipe_list_entries" ADD CONSTRAINT "recipe_list_entries_list_id_recipe_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."recipe_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_list_entries" ADD CONSTRAINT "recipe_list_entries_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_recipe_list_entries_unique" ON "recipe_list_entries" USING btree ("list_id","recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_list_entries_list_order" ON "recipe_list_entries" USING btree ("list_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_recipe_list_entries_recipe" ON "recipe_list_entries" USING btree ("recipe_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_list_name_case_insensitive" ON "recipe_lists" USING btree (lower(trim("name")),"org_id");--> statement-breakpoint
CREATE INDEX "idx_lists_featured_org" ON "recipe_lists" USING btree ("org_id","is_featured");--> statement-breakpoint
CREATE INDEX "idx_lists_org" ON "recipe_lists" USING btree ("org_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_lists_org_public" ON "recipe_lists" USING btree ("org_id","is_public","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ingredient_name_case_insensitive" ON "ingredients" USING btree (lower(trim("name")),"org_id");