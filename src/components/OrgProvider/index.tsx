import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Organisation } from "@/db/schema/organisations";
import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { FormatterContextProvider } from "@/hooks/useFormatter";

export async function OrgProvider({ children }: { children: React.ReactNode }) {
	const { userId, orgId: clerkOrgId } = await auth.protect();

	if (!clerkOrgId) {
		redirect("/setup");
	}

	let organisation: Organisation | undefined;
	try {
		organisation = await getOrCreateLocalOrganisation(clerkOrgId, userId);
	} catch (error) {
		console.error("OrgProvider: getOrCreateLocalOrganisation failed", {
			clerkOrgId,
			userId,
			error,
			message: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : undefined,
		});
		throw error;
	}

	if (!organisation) {
		console.error(
			"OrgProvider: getOrCreateLocalOrganisation returned undefined",
			{
				clerkOrgId,
				userId,
			},
		);
		throw new Error("OrgProvider: missing organisation row");
	}

	return (
		<FormatterContextProvider
			currency={organisation.currency}
			locale={organisation.defaultLocale}
		>
			{children}
		</FormatterContextProvider>
	);
}
