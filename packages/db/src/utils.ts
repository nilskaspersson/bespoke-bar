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

/** Postgres `foreign_key_violation` (e.g. deleting a row another table still references). */
export function isForeignKeyViolation(error: unknown): boolean {
	const cause = error instanceof Error ? error.cause : error;
	return (
		cause instanceof Error &&
		"code" in cause &&
		(cause as { code?: string }).code === "23503"
	);
}
