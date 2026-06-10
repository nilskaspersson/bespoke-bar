ALTER TABLE "specs" RENAME TO "ingredient_lines";--> statement-breakpoint
ALTER TABLE "ingredient_lines" DROP CONSTRAINT "quantity_null_or_positive";--> statement-breakpoint
ALTER TABLE "ingredient_lines" DROP CONSTRAINT "specs_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "ingredient_lines" DROP CONSTRAINT "specs_ingredient_id_ingredients_id_fk";
--> statement-breakpoint
DROP INDEX "idx_specs_ingredient";--> statement-breakpoint
DROP INDEX "idx_specs_recipe_ingredient";--> statement-breakpoint
ALTER TABLE "ingredient_lines" ADD CONSTRAINT "ingredient_lines_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_lines" ADD CONSTRAINT "ingredient_lines_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ingredient_lines_ingredient" ON "ingredient_lines" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_ingredient_lines_recipe_ingredient" ON "ingredient_lines" USING btree ("recipe_id","ingredient_id");--> statement-breakpoint
ALTER TABLE "ingredient_lines" ADD CONSTRAINT "quantity_null_or_positive" CHECK ("ingredient_lines"."quantity" IS NULL OR "ingredient_lines"."quantity" > 0);