import { AppHeader } from "@/components/AppHeader";

export default async function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<AppHeader />
			{children}
		</>
	);
}
