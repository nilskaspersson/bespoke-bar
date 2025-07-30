"use client";

import type { ComponentProps } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useWakeLock } from "@/hooks/useWakeLock";
import { Checkbox } from "@/ui/Checkbox";

export function WakeLock(props: Partial<ComponentProps<typeof Checkbox>>) {
	const isMounted = useIsMounted();
	const { isSupported, isActive, request, release } = useWakeLock();

	return (
		<Checkbox
			label="Prevent screen from turning off"
			checked={isSupported && isMounted ? isActive : false}
			onChange={isActive ? release : request}
			{...props}
		/>
	);
}
