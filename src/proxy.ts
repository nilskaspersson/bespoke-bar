import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
	checkRateLimit,
	createRateLimitMiddlewareResponse,
	shouldRateLimitRequest,
} from "@/rateLimit";

const isProtectedRoute = createRouteMatcher(["/bar(.*)"]);

export default clerkMiddleware(async (auth, req) => {
	/**
	 * Handle protected routes
	 */
	if (isProtectedRoute(req)) {
		const { userId } = await auth.protect();

		/**
		 * Rate limit server actions on protected routes.
		 */
		if (shouldRateLimitRequest(req)) {
			const rateLimitResponse = await checkRateLimit(
				userId,
				createRateLimitMiddlewareResponse,
			);

			const isRateLimited = Boolean(rateLimitResponse);

			if (isRateLimited) {
				return rateLimitResponse;
			}
		}
	}
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/api(.*)",
	],
};
