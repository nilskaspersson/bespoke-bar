import type { SQL } from "drizzle-orm";

import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export function sqlNormalizedString(s: AnyPgColumn): SQL {
	return sql`lower(trim(${s}))`;
}

export function isUniqueConstraintViolation(
	error: unknown,
	constraintName: string,
): boolean {
	const cause = error instanceof Error ? error.cause : error;
	return (
		cause instanceof Error &&
		"constraint" in cause &&
		cause.constraint === constraintName
	);
}
