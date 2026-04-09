"use client";

import { Toaster as SonnerToaster } from "sonner";
import type { ResolvedTheme } from "@/app/_theme/constants";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/ui/Icon";
import { Spinner } from "@/ui/Spinner";

const ICONS_MAP = {
	success: <Icon name="check" size={3} />,
	info: <Icon name="circle-info" size={3} />,
	warning: <Icon name="circle-exclamation" size={3} />,
	error: <Icon name="triangle-exclamation" size={3} />,
	loading: <Spinner size={5} />,
	close: <Icon name="xmark" size={2} />,
} as const;

const INVERTED: Record<ResolvedTheme, ResolvedTheme> = {
	light: "dark",
	dark: "light",
};

export function Toaster() {
	const { resolvedTheme } = useTheme();

	return (
		<SonnerToaster
			position="top-right"
			closeButton
			icons={ICONS_MAP}
			theme={INVERTED[resolvedTheme]}
		/>
	);
}
