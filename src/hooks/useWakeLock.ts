"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseWakeLockReturn = {
	isSupported: boolean;
	isActive: boolean;
	request: () => Promise<boolean>;
	release: () => Promise<void>;
};

export function useWakeLock(): UseWakeLockReturn {
	const wakeLockRef = useRef<WakeLockSentinel | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const isSupportedRef = useRef("wakeLock" in navigator);

	const [isActive, setIsActive] = useState(false);

	const request = useCallback(async (): Promise<boolean> => {
		if (!isSupportedRef.current || wakeLockRef.current) {
			return false;
		}

		try {
			const lock = await navigator.wakeLock.request("screen");
			wakeLockRef.current = lock;
			setIsActive(true);

			abortControllerRef.current = new AbortController();

			lock.addEventListener(
				"release",
				() => {
					setIsActive(false);
					wakeLockRef.current = null;
					abortControllerRef.current = null;
				},
				{ signal: abortControllerRef.current.signal },
			);

			return true;
		} catch (_e) {
			return false;
		}
	}, []);

	const release = useCallback(async (): Promise<void> => {
		await wakeLockRef.current?.release();
	}, []);

	useEffect(() => () => abortControllerRef.current?.abort(), []);

	return {
		isSupported: isSupportedRef.current,
		isActive,
		request,
		release,
	};
}
