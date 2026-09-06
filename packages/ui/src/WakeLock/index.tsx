"use client";

import type { ComponentProps } from "react";
import { Checkbox } from "../Checkbox";
import { useIsMounted } from "../hooks/useIsMounted";
import { useWakeLock } from "../hooks/useWakeLock";

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
