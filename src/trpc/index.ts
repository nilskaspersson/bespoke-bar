import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { getLocalOrgId } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { AppError, type AppErrorPayload } from "@/utils/appError";
import type { Auth } from "@/utils/auth";

type TRPCErrorCode = ConstructorParameters<typeof TRPCError>[0]["code"];

/**
 * Bridge between domain `AppError` enums and tRPC's HTTP-aligned codes.
 */
const APP_ERROR_TO_TRPC_CODE: Record<AppErrorPayload["code"], TRPCErrorCode> = {
	RATE_LIMIT_EXCEEDED: "TOO_MANY_REQUESTS",
	RECIPE_SLOT_LIMIT_REACHED: "FORBIDDEN",
	OCR_QUOTA_REACHED: "TOO_MANY_REQUESTS",
	NO_RECIPE_FOUND: "UNPROCESSABLE_CONTENT",
};

export async function createContext() {
	const { userId, orgId: clerkOrgId } = await auth();

	const orgId =
		userId && clerkOrgId ? await getLocalOrgId(clerkOrgId, userId) : null;

	return { userId, orgId, clerkOrgId };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
	errorFormatter({ shape, error }) {
		const appError =
			error.cause instanceof AppError ? error.cause.payload : null;

		return {
			...shape,
			message:
				error.code === "INTERNAL_SERVER_ERROR" && !appError
					? "Internal server error"
					: shape.message,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof z.ZodError
						? z.flattenError(error.cause)
						: null,
				appError,
			},
		};
	},
});

export type TRPCErrorData = {
	appError?: AppErrorPayload | null;
};

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.userId || !ctx.orgId || !ctx.clerkOrgId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	/**
	 * Translate any `AppError` into a `TRPCError` with the matching HTTP code.
	 * The mapping lives at the top of the file and is schema-driven, so the
	 * status is consistent across every variant. `errorFormatter` still pulls
	 * the original payload onto `data.appError` via `error.cause`.
	 */
	try {
		return await next({
			ctx: {
				userId: ctx.userId,
				orgId: ctx.orgId,
				clerkOrgId: ctx.clerkOrgId,
			} as Auth,
		});
	} catch (error) {
		if (error instanceof AppError) {
			throw new TRPCError({
				code: APP_ERROR_TO_TRPC_CODE[error.payload.code],
				message: error.message,
				cause: error,
			});
		}
		throw error;
	}
});
