CREATE TYPE "public"."ice" AS ENUM('none', 'cubed', 'crushed');--> statement-breakpoint
ALTER TYPE "public"."cocktail_styles" ADD VALUE 'manhattan' BEFORE 'martini';--> statement-breakpoint
ALTER TYPE "public"."cocktail_styles" ADD VALUE 'negroni' BEFORE 'oldFashioned';--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "ice" "ice";--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "ai_enriched_fields" text[];