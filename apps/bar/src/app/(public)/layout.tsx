import { Header } from "@bespoke/ui/Header";
import { Suspense } from "react";
import { AuthButtonsSkeleton } from "@/features/organisation/user/components/AuthButtons";
import { AuthButtonsLoader } from "@/features/organisation/user/components/AuthButtons/loader";

export default async function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Header>
				<Suspense fallback={<AuthButtonsSkeleton />}>
					<AuthButtonsLoader />
				</Suspense>
			</Header>
			{children}
		</>
	);
}
