CREATE TABLE "ocr_quota_grants" (
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
CREATE TABLE "ocr_quota_uses" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "base_ocr_quota" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "ocr_quota_grants" ADD CONSTRAINT "ocr_quota_grants_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocr_quota_uses" ADD CONSTRAINT "ocr_quota_uses_org_id_organisations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ocr_quota_grants_org_id_idx" ON "ocr_quota_grants" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ocr_quota_grants_external_id_uq" ON "ocr_quota_grants" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "ocr_quota_uses_org_id_created_at_idx" ON "ocr_quota_uses" USING btree ("org_id","created_at" DESC NULLS LAST);