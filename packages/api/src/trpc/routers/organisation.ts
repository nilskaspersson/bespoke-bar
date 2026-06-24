import { updateOrganisationFormSchema } from "@bespoke/schema/schema/organisations";
import { getOrCreateLocalOrganisation } from "../../organisation/getOrCreateLocalOrganisation";
import { updateLocalOrganisation } from "../../organisation/updateLocalOrganisation.service";
import { protectedProcedure, router } from "../index";

export const organisationRouter = router({
	get: protectedProcedure.query(({ ctx }) => {
		return getOrCreateLocalOrganisation(ctx.clerkOrgId, ctx.userId);
	}),

	update: protectedProcedure
		.input(updateOrganisationFormSchema)
		.mutation(({ ctx, input }) => {
			return updateLocalOrganisation(ctx, input);
		}),
});
