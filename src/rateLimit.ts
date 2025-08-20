import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export const rateLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(30, "60s"),
	prefix: "rl:ops",
	analytics: false,
});

type RatelimitResponse = Awaited<ReturnType<typeof rateLimiter.limit>>;

export async function checkRateLimit<T>(
	userId: string,
	onRateLimited: (result: RatelimitResponse) => T,
): Promise<T | null> {
	try {
		const result = await rateLimiter.limit(userId);

		if (!result.success) {
			return onRateLimited(result);
		}
	} catch (error) {
		/**
		 * If rate limiting errors, there's likely something wrong with the network, the
		 * configuration, or similar, and not an actual limited request. Allow through.
		 */
		console.warn("Rate limiting failed, allowing request:", error);
	}

	return null;
}

export function createRateLimitMiddlewareResponse(
	result: RatelimitResponse,
): NextResponse {
	const retryAfterSeconds = Math.round((result.reset - Date.now()) / 1000);

	return NextResponse.json(
		{
			error: "Rate limit exceeded",
			retryAfter: retryAfterSeconds,
			message: "You're moving too fast!",
		},
		{
			status: 429,
			headers: {
				"Retry-After": retryAfterSeconds.toString(),
				"X-RateLimit-Limit": result.limit.toString(),
				"X-RateLimit-Remaining": result.remaining.toString(),
				"X-RateLimit-Reset": result.reset.toString(),
			},
		},
	);
}

export function shouldRateLimitRequest(request: Request): boolean {
	if (process.env.ENABLE_RATE_LIMITING !== "true") {
		return false;
	}

	/**
	 * Rate limit all non-GET requests.
	 *
	 * Always passing GET seems fine, since we cache all assets and endpoints, and
	 * Vercel should protect us against overwhelming requests.
	 */
	return request.method !== "GET";
}
