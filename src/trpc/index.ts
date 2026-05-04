import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { AppError, type AppErrorPayload } from "@/utils/appError";
import type { Auth } from "@/utils/auth";

export async function createContext() {
	const { userId, orgId } = await auth();

	return { userId, orgId };
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
	if (!ctx.userId || !ctx.orgId) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({
		ctx: {
			userId: ctx.userId,
			orgId: ctx.orgId,
		} as Auth,
	});
});
