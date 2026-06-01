ALTER TABLE "ingredients" ALTER COLUMN "abv" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "ingredients" ALTER COLUMN "unitCost" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "menu_entries" ALTER COLUMN "price" SET DATA TYPE numeric(12, 4);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "dilution_target" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "specs" ALTER COLUMN "quantity" SET DATA TYPE double precision;