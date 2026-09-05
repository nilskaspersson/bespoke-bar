"use client";

import { Checkbox } from "@bespoke/ui/Checkbox";
import { useIsMounted } from "@bespoke/ui/hooks/useIsMounted";
import type { ComponentProps } from "react";
import { useWakeLock } from "@/hooks/useWakeLock";

export function WakeLock(props: Partial<ComponentProps<typeof Checkbox>>) {
	const isMounted = useIsMounted();
	const { isSupported, isActive, request, release } = useWakeLock();

	return (
		<Checkbox
			label="Keep screen awake"
			checked={isSupported && isMounted ? isActive : false}
			onChange={isActive ? release : request}
			{...props}
		/>
	);
}
