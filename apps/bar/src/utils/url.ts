const PATTERN_URL_FRIENDLY_SLUG = /^[a-zA-Z0-9_-]+$/;

export function isValidPageUrl(
	id: string | undefined,
	slug?: string[],
): boolean {
	if (!id || !PATTERN_URL_FRIENDLY_SLUG.test(id)) {
		return false;
	}

	/**
	 * Slug is optional to enable human-readable URLs, but with Next.js, the only
	 * optional segment pattern is a catch-all.
	 */
	if (!slug || slug.length === 0) {
		return true;
	}

	return slug.every((segment) => PATTERN_URL_FRIENDLY_SLUG.test(segment));
}

/** @public */
export function getServerSideBaseURL(): string {
	if (
		process.env.VERCEL_ENV === "production" &&
		process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
	) {
		return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL) {
		return `https://${process.env.VERCEL_BRANCH_URL}`;
	}

	return "http://localhost:3000";
}
