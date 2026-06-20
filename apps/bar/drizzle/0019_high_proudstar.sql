CREATE TABLE "recipe_slot_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"amount" integer NOT NULL,
	"source" text NOT NULL,
	"external_id" text,
	"note" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "idx_recipes_org_archived";--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "base_recipe_slots" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
CREATE INDEX "recipe_slot_grants_org_id_idx" ON "recipe_slot_grants" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_slot_grants_external_id_uq" ON "recipe_slot_grants" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_org_id" ON "recipes" USING btree ("org_id");--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "archived_by";--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "archived_at";