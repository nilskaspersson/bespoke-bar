import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

export async function createContext() {
	const { userId, orgId } = await auth();

	return { userId, orgId };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			message:
				error.code === "INTERNAL_SERVER_ERROR"
					? "Internal server error"
					: shape.message,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof z.ZodError
						? z.flattenError(error.cause)
						: null,
			},
		};
	},
});

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
		},
	});
});
