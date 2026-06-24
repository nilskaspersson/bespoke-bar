/**
 * Remove angle brackets from untrusted text before interpolating it into a
 * delimited prompt tag (e.g. `<recipe>…</recipe>`), so a crafted value can't
 * forge or close the delimiter and smuggle text outside the data boundary the
 * system prompt relies on.
 *
 * One layer only: it does NOT neutralize prose injection ("ignore previous
 * instructions…") inside the tag. That is contained by constrained output,
 * output validation, and least-privilege sinks — not by this.
 */
export function stripTagDelimiters(value: string): string {
	return value.replace(/[<>]/g, "");
}

/** Detects Vertex/Gemini deadline or timeout errors; the SDK surfaces no typed code. */
export function isTimeoutError(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.message.includes("DEADLINE_EXCEEDED") ||
			error.message.includes("timeout"))
	);
}
