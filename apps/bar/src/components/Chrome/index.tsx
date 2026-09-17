import shell from "@bespoke/ui/AppShell/styles.module.css";
import { Footer } from "@bespoke/ui/Footer";
import { Header } from "@bespoke/ui/Header";
import { ThemePicker } from "@bespoke/ui/ThemePicker";
import { WakeLock } from "@bespoke/ui/WakeLock";
import { type PropsWithChildren, Suspense } from "react";
import { AuthButtonsSkeleton } from "@/features/organisation/user/components/AuthButtons";
import { AuthButtonsLoader } from "@/features/organisation/user/components/AuthButtons/loader";

const LOUNGE_URL = process.env.NEXT_PUBLIC_LOUNGE_URL ?? "";

export function Chrome({ children }: PropsWithChildren) {
	return (
		<>
			<Header className={shell.header}>
				<Suspense fallback={<AuthButtonsSkeleton />}>
					<AuthButtonsLoader />
				</Suspense>
			</Header>

			<Suspense fallback={<main className={shell.main} />}>
				<main className={shell.main}>{children}</main>
			</Suspense>

			<Suspense>
				<Footer className={shell.footer} barUrl="" loungeUrl={LOUNGE_URL}>
					<ThemePicker />
					<WakeLock size="small" />
				</Footer>
			</Suspense>
		</>
	);
}
