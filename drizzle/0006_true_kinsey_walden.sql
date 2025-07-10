CREATE TABLE "organisations" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_org_id" text NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR' NOT NULL,
	"default_locale" varchar(10) DEFAULT 'en-GB' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	CONSTRAINT "organisations_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
