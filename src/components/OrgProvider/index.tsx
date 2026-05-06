import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { FormatterContextProvider } from "@/hooks/useFormatter";

export async function OrgProvider({ children }: { children: React.ReactNode }) {
	const { userId, orgId } = await auth.protect();

	if (!orgId) {
		redirect("/setup");
	}

	const organisation = await getOrCreateLocalOrganisation(orgId, userId);

	return (
		<FormatterContextProvider
			currency={organisation.currency}
			locale={organisation.defaultLocale}
		>
			{children}
		</FormatterContextProvider>
	);
}
