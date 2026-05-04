import { getCachedRecipeSlotUsage } from "@/features/billing/api/getRecipeSlotUsage";
import { protectedProcedure, router } from "@/trpc";

export const billingRouter = router({
	usage: protectedProcedure.query(({ ctx }) => {
		return getCachedRecipeSlotUsage(ctx.orgId);
	}),
});
