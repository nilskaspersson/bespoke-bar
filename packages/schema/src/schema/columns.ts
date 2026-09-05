import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { OrganisationsTable } from "./organisations";

export function nanoidPk() {
	return text("id")
		.primaryKey()
		.$defaultFn(() => nanoid(10));
}

export function orgIdCascade() {
	return text("org_id")
		.notNull()
		.references(() => OrganisationsTable.id, { onDelete: "cascade" });
}

export function createdAtCol() {
	return timestamp("created_at", { mode: "string", withTimezone: true })
		.defaultNow()
		.notNull();
}

export const GRANT_SOURCES = [
	"purchase",
	"bonus_referral",
	"bonus_activity",
	"manual",
	"refund",
] as const;

export function grantLedgerColumns() {
	return {
		id: nanoidPk(),
		orgId: orgIdCascade(),
		amount: integer("amount").notNull(),
		source: text("source", { enum: GRANT_SOURCES }).notNull(),
		externalId: text("external_id"),
		note: text("note"),
		createdBy: text("created_by"),
		createdAt: createdAtCol(),
	};
}
