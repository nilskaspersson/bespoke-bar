ALTER TABLE "ingredients" RENAME COLUMN "price" TO "unitCost";--> statement-breakpoint
ALTER TABLE "ingredients" DROP CONSTRAINT "price_positive";--> statement-breakpoint
ALTER TABLE "ingredients" DROP CONSTRAINT "price_requires_measurement_type";--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "cost_positive" CHECK ("ingredients"."unitCost" IS NULL OR "ingredients"."unitCost" > 0);--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "cost_requires_measurement_type" CHECK ("ingredients"."unitCost" IS NULL OR "ingredients"."measurementType" IS NOT NULL);