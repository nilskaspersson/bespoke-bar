import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { AuthButtonsSkeleton } from "@/features/organisation/user/components/AuthButtons";
import { AuthButtonsLoader } from "@/features/organisation/user/components/AuthButtons/loader";

export default async function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<AppHeader>
				<Suspense fallback={<AuthButtonsSkeleton />}>
					<AuthButtonsLoader />
				</Suspense>
			</AppHeader>
			{children}
		</>
	);
}
