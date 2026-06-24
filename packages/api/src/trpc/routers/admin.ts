import { z } from "zod";
import { getAdminOrgDetails } from "../../admin/getAdminOrgDetails";
import { listOrganisationsForAdmin } from "../../admin/listOrganisationsForAdmin";
import { adminProcedure, router } from "../index";

export const adminRouter = router({
	organisations: adminProcedure.query(() => listOrganisationsForAdmin()),
	orgDetails: adminProcedure
		.input(z.object({ orgId: z.string().min(1) }))
		.query(({ input }) => getAdminOrgDetails(input.orgId)),
});
