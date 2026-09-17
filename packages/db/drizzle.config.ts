import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../apps/bar/.env" });

export default defineConfig({
	out: "./drizzle",
	schema: "../schema/src/schema",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});
