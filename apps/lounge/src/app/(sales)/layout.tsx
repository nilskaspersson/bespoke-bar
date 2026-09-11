import { ClosingCta } from "@/components/ClosingCta";

const BAR_URL = process.env.NEXT_PUBLIC_BAR_URL ?? "";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<ClosingCta barUrl={BAR_URL} />
		</>
	);
}
