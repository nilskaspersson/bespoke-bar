CREATE TYPE "public"."system_category" AS ENUM('absinthe', 'aquavit', 'armagnac', 'baijiu', 'bourbon', 'brandy', 'cachaca', 'calvados', 'cognac', 'gin', 'genever', 'grappa', 'mezcal', 'pisco', 'rum', 'rye', 'shochu', 'tequila', 'vodka', 'whiskey', 'vermouth', 'sherry', 'port', 'aperitif', 'sake', 'amaro', 'bitters', 'liqueur', 'herbal_liqueur', 'wine', 'champagne', 'beer', 'citrus', 'fruit', 'herb', 'cocktail_bitters', 'egg', 'syrup', 'soda', 'dairy', 'juice', 'honey', 'garnish', 'other');--> statement-breakpoint
CREATE TYPE "public"."preparation_method" AS ENUM('blended', 'built', 'carbonated', 'shaken', 'stirred');--> statement-breakpoint
CREATE TYPE "public"."measurement_type" AS ENUM('volume', 'mass', 'pieces');--> statement-breakpoint
CREATE TYPE "public"."unit" AS ENUM('cl', 'cup', 'fl_oz', 'l', 'ml', 'tbsp', 'tsp');--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" "system_category",
	"abv" real,
	"brand" varchar(100),
	"price" real,
	"measurementType" "measurement_type",
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"created_by" text NOT NULL,
	"updated_by" text,
	CONSTRAINT "abv_valid_range" CHECK ("ingredients"."abv" IS NULL OR ("ingredients"."abv" >= 0 AND "ingredients"."abv" <= 1)),
	CONSTRAINT "price_positive" CHECK ("ingredients"."price" IS NULL OR "ingredients"."price" > 0),
	CONSTRAINT "price_requires_measurement_type" CHECK ("ingredients"."price" IS NULL OR "ingredients"."measurementType" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"description" varchar(5000),
	"preparation_method" "preparation_method",
	"archived_by" text,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_at" timestamp,
	"updated_by" text,
	"org_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specs" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"quantity" real,
	"unit" "unit",
	"ingredient_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quantity_null_or_positive" CHECK ("specs"."quantity" IS NULL OR "specs"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "specs" ADD CONSTRAINT "specs_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_name_case_insensitive" ON "ingredients" USING btree (lower(trim("name")),"org_id");--> statement-breakpoint
CREATE INDEX "idx_ingredients_org" ON "ingredients" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_org" ON "recipes" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_specs_recipe" ON "specs" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "idx_specs_ingredient" ON "specs" USING btree ("ingredient_id");