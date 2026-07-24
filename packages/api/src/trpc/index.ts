import type { AppErrorPayload } from "@bespoke/schema/appError";
import { AppError } from "@bespoke/schema/appError";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { isAdminUser } from "../admin";
import type { Auth } from "../auth";
import { getLocalOrgId } from "../organisation/getOrCreateLocalOrganisation";
import { serializeWireTimestamps } from "./serializeTimestamp";
import {
	getMinAppVersion,
	isBelowFloor,
	readClientHeaders,
} from "./versionFloor";

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

/**
 * Translate an `AppError` into a `TRPCError` with the matching HTTP code. The
 * mapping is schema-driven, so status is consistent across every variant;
 * `errorFormatter` still pulls the original payload onto `data.appError` via
 * `error.cause`.
 */
function toTRPCError(error: AppError): TRPCError {
	return new TRPCError({
		code: APP_ERROR_TO_TRPC_CODE[error.payload.code],
		message: error.message,
		cause: error,
	});
}

export async function createContext(opts?: { headers?: Headers }) {
	const { userId, orgId: clerkOrgId } = await auth();

	const orgId =
		userId && clerkOrgId ? await getLocalOrgId(clerkOrgId, userId) : null;

	return {
		userId,
		orgId,
		clerkOrgId,
		client: readClientHeaders(opts?.headers),
	};
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
 * Per-platform min-version floor (ADR-0009), gated on the shared base so it
 * runs on public, protected, and admin alike — and *before* auth, so an
 * outdated binary sees the update wall, not an `UNAUTHORIZED` masking it. Web
 * traffic sends no cohort headers and returns immediately before any Edge
 * Config read.
 */
const versionFloor = t.middleware(async ({ ctx, next }) => {
	const { platform, version } = ctx.client;
	if (!platform || !version) {
		return next();
	}

	console.log(JSON.stringify({ evt: "app-cohort", platform, version }));

	const floor = await getMinAppVersion(platform);
	if (floor && isBelowFloor(version, floor)) {
		throw toTRPCError(
			new AppError({ code: "UPDATE_REQUIRED", minVersion: floor }),
		);
	}

	return next();
});

/**
 * Every procedure's output passes through wire-timestamp canonicalization
 * here, by construction — not per procedure. New procedure variants must
 * derive from `baseProcedure` (or the exports below), never from
 * `t.procedure` directly, or their timestamps ship raw.
 */
const baseProcedure = t.procedure.use(versionFloor).use(async ({ next }) => {
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
			throw toTRPCError(error);
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
