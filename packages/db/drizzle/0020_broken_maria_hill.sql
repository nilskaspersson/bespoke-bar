/*
 * Migrate every entity's `org_id` from `organisations.clerk_org_id` (Clerk's
 * external id) to `organisations.id` (the local nanoid PK), then enforce that
 * relationship with a FK + ON DELETE CASCADE so dropping an organisation
 * cleans every dependent row in one statement.
 *
 * The migration aborts if any entity row references a clerk_org_id that has
 * no matching organisations row — that's an orphan we shouldn't silently
 * paper over. Resolve those upstream (insert the missing organisations row
 * or delete the orphan child rows) and retry.
 */

DO $$
DECLARE
	orphan_count int;
BEGIN
	SELECT COUNT(*) INTO orphan_count FROM (
		SELECT 1 FROM "recipes" r
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = r."org_id")
		UNION ALL
		SELECT 1 FROM "ingredients" i
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = i."org_id")
		UNION ALL
		SELECT 1 FROM "tags" t
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = t."org_id")
		UNION ALL
		SELECT 1 FROM "recipe_favorites" f
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = f."org_id")
		UNION ALL
		SELECT 1 FROM "recipe_list_entries" e
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = e."org_id")
		UNION ALL
		SELECT 1 FROM "recipe_lists" l
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = l."org_id")
		UNION ALL
		SELECT 1 FROM "recipe_tags" rt
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = rt."org_id")
		UNION ALL
		SELECT 1 FROM "recipe_slot_grants" g
			WHERE NOT EXISTS (SELECT 1 FROM "organisations" o WHERE o."clerk_org_id" = g."org_id")
	) AS orphans;

	IF orphan_count > 0 THEN
		RAISE EXCEPTION 'Found % entity row(s) referencing a clerk_org_id with no matching organisations row. Resolve before retrying.', orphan_count;
	END IF;
END $$;
--> statement-breakpoint

UPDATE "recipes" SET "org_id" = o."id" FROM "organisations" o WHERE "recipes"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "ingredients" SET "org_id" = o."id" FROM "organisations" o WHERE "ingredients"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "tags" SET "org_id" = o."id" FROM "organisations" o WHERE "tags"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "recipe_favorites" SET "org_id" = o."id" FROM "organisations" o WHERE "recipe_favorites"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "recipe_list_entries" SET "org_id" = o."id" FROM "organisations" o WHERE "recipe_list_entries"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "recipe_lists" SET "org_id" = o."id" FROM "organisations" o WHERE "recipe_lists"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "recipe_tags" SET "org_id" = o."id" FROM "organisations" o WHERE "recipe_tags"."org_id" = o."clerk_org_id";--> statement-breakpoint
UPDATE "recipe_slot_grants" SET "org_id" = o."id" FROM "organisations" o WHERE "recipe_slot_grants"."org_id" = o."clerk_org_id";--> statement-breakpoint

ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_list_entries" ADD CONSTRAINT "recipe_list_entries_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_lists" ADD CONSTRAINT "recipe_lists_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_slot_grants" ADD CONSTRAINT "recipe_slot_grants_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;
