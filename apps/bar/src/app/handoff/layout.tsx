import shell from "@bespoke/ui/AppShell/styles.module.css";
import type { PropsWithChildren } from "react";

export default function HandoffLayout({ children }: PropsWithChildren) {
	return <main className={shell.main}>{children}</main>;
}
