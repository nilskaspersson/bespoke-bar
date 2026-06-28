"use client";

import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./layout.module.css";

export function MenusShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const detailOpen = pathname !== "/menus";

	return (
		<div className={clsx(styles.shell, { [styles.detailOpen]: detailOpen })}>
			{children}
		</div>
	);
}
