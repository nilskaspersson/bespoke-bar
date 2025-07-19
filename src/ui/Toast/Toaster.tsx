"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { Icon } from "@/ui/Icon";
import { Spinner } from "@/ui/Spinner";
import styles from "./styles.module.css";

const ICONS_MAP = {
	success: <Icon name="check" size={3} />,
	info: <Icon name="circle-info" size={3} />,
	warning: <Icon name="circle-exclamation" size={3} />,
	error: <Icon name="triangle-exclamation" size={3} />,
	loading: <Spinner size={5} />,
	close: <Icon name="xmark" size={2} />,
} as const;

export function Toaster() {
	const { resolvedTheme } = useTheme();

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<div
			className={styles.toaster}
			data-force-theme={
				isMounted ? (resolvedTheme === "dark" ? "light" : "dark") : undefined
			}
		>
			<SonnerToaster position="top-center" closeButton icons={ICONS_MAP} />
		</div>
	);
}
