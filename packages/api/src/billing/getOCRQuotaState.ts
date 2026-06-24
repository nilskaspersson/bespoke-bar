import {
	deriveOCRQuotaState,
	type OCRQuotaState,
} from "@bespoke/domain/billing/getOCRQuotaState";
import { getCachedOCRQuotaLimit } from "./getOCRQuotaLimit";
import { getCachedOCRQuotaUsage } from "./getOCRQuotaUsage";

export type { OCRQuotaState };

/**
 * Not itself cached: each half owns its own `cacheLife("max")` + tag, and the
 * two tags invalidate on very different cadences (rare grants vs every Use).
 */
export async function getCachedOCRQuotaState(
	orgId: string,
): Promise<OCRQuotaState> {
	const [limit, usage] = await Promise.all([
		getCachedOCRQuotaLimit(orgId),
		getCachedOCRQuotaUsage(orgId),
	]);

	return deriveOCRQuotaState({
		limit,
		used: usage.used,
		monthStartMs: usage.monthStartMs,
		nowMs: Date.now(),
	});
}
