import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware(async (auth, req) => {
	const { pathname } = req.nextUrl;

	/**
	 * API routes handle auth themselves, and the handoff page is authenticated
	 * by its link.
	 */
	if (pathname.startsWith("/api/") || pathname.startsWith("/handoff/")) return;

	/**
	 * Eagerly redirect unauthenticated users
	 */
	const { isAuthenticated, redirectToSignIn } = await auth();

	if (!isAuthenticated) return redirectToSignIn();
});

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/api(.*)",
	],
};
