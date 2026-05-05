import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { rateLimitEnabledFlag } from "@/flags";

const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
	process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

/**
 * Guard construction so missing config is a fast no-op, not a per-request stall.
 */
const redis = url && token ? new Redis({ url, token }) : null;

export const rateLimiter = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(30, "60s"),
			prefix: "rl:ops",
			analytics: false,
		})
	: null;

type RatelimitResponse = Awaited<ReturnType<Ratelimit["limit"]>>;

export async function checkRateLimit<T>(
	userId: string,
	onRateLimited: (result: RatelimitResponse) => T,
): Promise<T | null> {
	if (!rateLimiter) {
		return null;
	}

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

export async function shouldRateLimitRequest(
	request: Request,
): Promise<boolean> {
	/**
	 * Rate limit all non-GET requests.
	 *
	 * Always passing GET seems fine, since we cache all assets and endpoints, and
	 * Vercel should protect us against overwhelming requests.
	 */
	if (request.method === "GET") {
		return false;
	}

	return await rateLimitEnabledFlag();
}
