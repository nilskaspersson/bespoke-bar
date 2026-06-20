import { z } from "zod";
import { getAdminOrgDetails } from "@/features/admin/api/getAdminOrgDetails";
import { listOrganisationsForAdmin } from "@/features/admin/api/listOrganisationsForAdmin";
import { adminProcedure, router } from "@/trpc";

export const adminRouter = router({
	organisations: adminProcedure.query(() => listOrganisationsForAdmin()),
	orgDetails: adminProcedure
		.input(z.object({ orgId: z.string().min(1) }))
		.query(({ input }) => getAdminOrgDetails(input.orgId)),
});
