import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { get } from "@vercel/edge-config";
import { cache } from "react";
import { AppError } from "@/utils/appError";

const url = process.env.UPSTASH_KV_REST_API_URL;
const token = process.env.UPSTASH_KV_REST_API_TOKEN;

/**
 * Guard construction so missing config is a fast no-op, not a per-request stall.
 */
const redis = url && token ? new Redis({ url, token }) : null;

const rateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(30, "60s"),
			prefix: "rl:ops",
			analytics: false,
		})
	: null;

async function getEnabledRateLimiter() {
	if (!rateLimiter) return null;
	const enabled = (await get<boolean>("rate-limit-enabled")) ?? false;
	return enabled ? rateLimiter : null;
}

/**
 * Request-scoped `cache` so a hypothetical multiple write-service calls
 * within the same request only consume one quota hit.
 */
export const rateLimit = cache(async (userId: string): Promise<void> => {
	const limiter = await getEnabledRateLimiter();
	if (!limiter) return;

	try {
		const result = await limiter.limit(userId);

		if (!result.success) {
			throw new AppError({
				code: "RATE_LIMIT_EXCEEDED",
				retryAfter: Math.max(1, Math.round((result.reset - Date.now()) / 1000)),
			});
		}
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}

		console.warn("Rate limiting failed, allowing request:", error);
	}
});
