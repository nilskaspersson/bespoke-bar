CREATE TYPE "public"."cocktail_styles" AS ENUM('aperitif', 'cooler', 'digestif', 'fizz', 'flip', 'highball', 'julep', 'martini', 'oldFashioned', 'other', 'punch', 'smash', 'sour', 'spritz', 'tiki');--> statement-breakpoint
CREATE TYPE "public"."glassware" AS ENUM('coupe', 'fizz', 'flute', 'highball', 'hurricane', 'julep', 'martini', 'nick_nora', 'pilsner', 'port', 'rocks_double', 'rocks', 'shot', 'snifter', 'tiki_mug', 'wine');--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "preparation_method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."preparation_method";--> statement-breakpoint
CREATE TYPE "public"."preparation_method" AS ENUM('blended', 'built', 'layered', 'shaken', 'stirred');--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "preparation_method" SET DATA TYPE "public"."preparation_method" USING "preparation_method"::"public"."preparation_method";--> statement-breakpoint
DROP INDEX "idx_recipes_org";--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "dilution_target" real;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "glassware" "glassware";--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "garnish" varchar(100);--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "style" "cocktail_styles";--> statement-breakpoint
CREATE INDEX "idx_recipes_org" ON "recipes" USING btree ("org_id","created_at" DESC NULLS LAST);