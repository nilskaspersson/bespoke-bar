import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { getOrCreateLocalOrganisation } from "@/features/organisation/api/getOrCreateLocalOrganisation";
import { FormatterContextProvider } from "@/hooks/useFormatter";

export async function OrgProvider({ children }: { children: React.ReactNode }) {
	const { userId, orgId } = await auth.protect();

	/**
	 * Users should always have an organisation automatically created by Clerk.
	 */
	if (!orgId) {
		forbidden();
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
