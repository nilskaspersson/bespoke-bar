import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isLimitingEnabled } from "./rateLimit";

const url = process.env.UPSTASH_KV_REST_API_URL;
const token = process.env.UPSTASH_KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Way above normal use. Bounds abuse loops.
 */
const ENRICHMENT_QUOTA_PER_DAY = 1000;

const enrichmentLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(ENRICHMENT_QUOTA_PER_DAY, "24h"),
			prefix: "rl:enrich",
			analytics: false,
		})
	: null;

/**
 * Whether the org may run the paid LLM step. Shares the `rate-limit-enabled`
 * kill switch (off → allow). Fail-closed on error since this guards spend; allow
 * when no limiter is configured (local dev).
 */
export async function reserveEnrichmentBudget(
	orgId: string,
	items: number,
): Promise<boolean> {
	if (!enrichmentLimiter || items <= 0) {
		return true;
	}

	try {
		if (!(await isLimitingEnabled())) {
			return true;
		}
		const { success } = await enrichmentLimiter.limit(orgId, { rate: items });
		return success;
	} catch (error) {
		console.warn(
			"Enrichment quota check failed; skipping to protect spend",
			error,
		);
		return false;
	}
}
