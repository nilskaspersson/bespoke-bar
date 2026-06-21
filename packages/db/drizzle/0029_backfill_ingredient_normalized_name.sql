/*
 * Backfill `normalized_name` for rows predating column 0028 (added nullable so it
 * could land on a populated table). The value is `lower(trim("name"))` — the exact
 * expression the ingredient unique index used from 0000 through 0017, before 0028
 * swapped it for this stored column. So the backfill (a) reproduces what the app's
 * `normalizeIngredientName` (`trim().toLowerCase()`) computes for the already-trimmed
 * names, and (b) cannot collide on the unique index: that index forbade case-variant
 * duplicates per org all along. Migration 0030 then sets the column NOT NULL.
 */

UPDATE "ingredients" SET "normalized_name" = lower(trim("name")) WHERE "normalized_name" IS NULL;
