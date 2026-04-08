import { getAuth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import type { NextRequest } from "next/server";
import superjson from "superjson";

export async function createContext(req: NextRequest) {
	const { userId, orgId } = await getAuth(req);

	return { userId, orgId };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
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
