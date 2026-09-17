import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	closeHandoff,
	extendHandoff,
	HandoffError,
	handoffNonceSchema,
	readHandoffStatus,
} from "../../recipes/photo/handoff/handoff.service";
import { protectedProcedure, router } from "../index";

const TRPC_CODE: Record<HandoffError["code"], TRPCError["code"]> = {
	forbidden: "FORBIDDEN",
	unavailable: "PRECONDITION_FAILED",
};

async function guarded<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		if (error instanceof HandoffError) {
			throw new TRPCError({
				code: TRPC_CODE[error.code],
				message: error.message,
				cause: error,
			});
		}
		throw error;
	}
}

const nonceInput = z.object({ nonce: handoffNonceSchema });

export const handoffRouter = router({
	status: protectedProcedure.input(nonceInput).query(({ ctx, input }) => {
		return guarded(() => readHandoffStatus(input.nonce, ctx.orgId));
	}),

	extend: protectedProcedure.input(nonceInput).mutation(({ ctx, input }) => {
		return guarded(() => extendHandoff(input.nonce, ctx.orgId));
	}),

	close: protectedProcedure.input(nonceInput).mutation(({ ctx, input }) => {
		return guarded(() => closeHandoff(input.nonce, ctx.orgId));
	}),
});
