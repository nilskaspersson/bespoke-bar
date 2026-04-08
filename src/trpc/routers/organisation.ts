import { updateOrganisationFormSchema } from "@/db/schema/organisations";
import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { updateLocalOrganisation } from "@/features/organisation/api/updateLocalOrganisation.service";
import { protectedProcedure, router } from "@/trpc";

export const organisationRouter = router({
	get: protectedProcedure.query(({ ctx }) => {
		return getOrCreateLocalOrganisation(ctx.orgId, ctx.userId);
	}),

	update: protectedProcedure
		.input(updateOrganisationFormSchema)
		.mutation(({ ctx, input }) => {
			return updateLocalOrganisation(ctx, input);
		}),
});
