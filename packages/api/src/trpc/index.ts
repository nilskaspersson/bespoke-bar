import type { AppErrorPayload } from "@bespoke/schema/appError";
import { AppError } from "@bespoke/schema/appError";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { isAdminUser } from "../admin";
import type { Auth } from "../auth";
import { getLocalOrgId } from "../organisation/getOrCreateLocalOrganisation";
import { serializeWireTimestamps } from "./serializeTimestamp";

type TRPCErrorCode = ConstructorParameters<typeof TRPCError>[0]["code"];

/**
 * Bridge between domain `AppError` enums and tRPC's HTTP-aligned codes.
 */
const APP_ERROR_TO_TRPC_CODE: Record<AppErrorPayload["code"], TRPCErrorCode> = {
	RATE_LIMIT_EXCEEDED: "TOO_MANY_REQUESTS",
	RECIPE_SLOT_LIMIT_REACHED: "FORBIDDEN",
	RECIPE_LINE_LIMIT_REACHED: "BAD_REQUEST",
	INGREDIENT_IN_USE: "CONFLICT",
	OCR_QUOTA_REACHED: "TOO_MANY_REQUESTS",
	NO_RECIPE_FOUND: "UNPROCESSABLE_CONTENT",
	NO_RECIPES_PROVIDED: "BAD_REQUEST",
	UPDATE_REQUIRED: "PRECONDITION_FAILED",
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

/** @public */
export type TRPCErrorData = {
	appError?: AppErrorPayload | null;
};

/**
 * Every procedure's output passes through wire-timestamp canonicalization
 * here, by construction — not per procedure. New procedure variants must
 * derive from `baseProcedure` (or the exports below), never from
 * `t.procedure` directly, or their timestamps ship raw.
 */
const baseProcedure = t.procedure.use(async ({ next }) => {
	const result = await next();
	return result.ok
		? { ...result, data: serializeWireTimestamps(result.data) }
		: result;
});

export const router = t.router;
/** @public */
export const publicProcedure = baseProcedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
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

export const adminProcedure = baseProcedure.use(async ({ ctx, next }) => {
	if (!ctx.userId || !(await isAdminUser(ctx.userId))) {
		throw new TRPCError({ code: "FORBIDDEN" });
	}

	return next({ ctx: { ...ctx, userId: ctx.userId } });
});
