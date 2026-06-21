import { getOrCreateLocalOrganisation } from "@bespoke/api/organisation/getOrCreateLocalOrganisation";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FormatterContextProvider } from "@/hooks/useFormatter";

export async function OrgProvider({ children }: { children: React.ReactNode }) {
	const { userId, orgId: clerkOrgId } = await auth.protect();

	if (!clerkOrgId) {
		redirect("/setup");
	}

	const organisation = await getOrCreateLocalOrganisation(
		clerkOrgId,
		userId,
	).catch((error) => {
		console.error("OrgProvider: bootstrap failed", {
			clerkOrgId,
			userId,
			error,
		});
		throw error;
	});

	return (
		<FormatterContextProvider
			currency={organisation.currency}
			locale={organisation.defaultLocale}
		>
			{children}
		</FormatterContextProvider>
	);
}
