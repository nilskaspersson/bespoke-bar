CREATE TABLE "recipe_favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"user_id" text NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recipe_favorites_user_recipe_unique" UNIQUE("user_id","recipe_id")
);
--> statement-breakpoint
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_recipe_favorites_user_org" ON "recipe_favorites" USING btree ("org_id","user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_recipe_favorites_recipe" ON "recipe_favorites" USING btree ("recipe_id");