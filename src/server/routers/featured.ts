import { z } from "zod/v4";
import { clearFeaturedList } from "@/features/lists/featured/api/clearFeaturedList.service";
import { getCachedFeaturedList } from "@/features/lists/featured/api/readFeaturedList";
import { setFeaturedList } from "@/features/lists/featured/api/setFeaturedList.service";
import { protectedProcedure, router } from "@/server/trpc";

export const featuredRouter = router({
	get: protectedProcedure.query(({ ctx }) => {
		return getCachedFeaturedList(ctx.orgId);
	}),

	set: protectedProcedure
		.input(z.object({ listId: z.string() }))
		.mutation(({ ctx, input }) => {
			return setFeaturedList(ctx, input.listId);
		}),

	clear: protectedProcedure.mutation(({ ctx }) => {
		return clearFeaturedList(ctx);
	}),
});
