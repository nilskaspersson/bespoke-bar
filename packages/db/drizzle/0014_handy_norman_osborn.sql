ALTER TABLE "recipe_list_entries" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recipe_list_entries" ADD COLUMN "updated_at" timestamp;