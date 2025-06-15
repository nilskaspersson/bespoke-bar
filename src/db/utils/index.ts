import type { SQL } from "drizzle-orm";

import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export function sqlNormalizedString(s: AnyPgColumn): SQL {
	return sql`lower(trim(${s}))`;
}
