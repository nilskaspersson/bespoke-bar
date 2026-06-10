ALTER TABLE "ingredients" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."system_category";--> statement-breakpoint
CREATE TYPE "public"."system_category" AS ENUM('absinthe', 'aquavit', 'armagnac', 'baijiu', 'bourbon', 'brandy', 'cachaca', 'calvados', 'cognac', 'gin', 'genever', 'grappa', 'mezcal', 'pisco', 'rum', 'rye', 'shochu', 'tequila', 'vodka', 'whiskey', 'vermouth', 'sherry', 'port', 'aperitif', 'sake', 'amaro', 'bitters', 'liqueur', 'herbal_liqueur', 'wine', 'champagne', 'beer', 'citrus', 'fruit', 'herb', 'cocktail_bitters', 'egg', 'syrup', 'soda', 'dairy', 'juice', 'honey', 'other');--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "category" SET DATA TYPE "public"."system_category" USING "category"::"public"."system_category";--> statement-breakpoint
DROP INDEX "unique_ingredient_name_case_insensitive";--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "normalized_name" text;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ingredient_name_case_insensitive" ON "ingredients" USING btree ("org_id","normalized_name");