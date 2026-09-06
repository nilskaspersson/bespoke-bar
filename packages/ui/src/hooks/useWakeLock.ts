"use client";

import { useCallback, useSyncExternalStore } from "react";

let wakeLock: WakeLockSentinel | null = null;

const listeners = new Set<() => void>();

function getSnapshot(): boolean {
	return wakeLock !== null;
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function notify() {
	for (const listener of listeners) {
		listener();
	}
}

const isSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;

async function requestWakeLock(): Promise<boolean> {
	if (!isSupported || wakeLock) {
		return false;
	}

	try {
		wakeLock = await navigator.wakeLock.request("screen");

		wakeLock.addEventListener("release", () => {
			wakeLock = null;
			notify();
		});

		notify();
		return true;
	} catch {
		return false;
	}
}

async function releaseWakeLock(): Promise<void> {
	await wakeLock?.release();
}

type UseWakeLockReturn = {
	isSupported: boolean;
	isActive: boolean;
	request: () => Promise<boolean>;
	release: () => Promise<void>;
};

export function useWakeLock(): UseWakeLockReturn {
	const isActive = useSyncExternalStore(subscribe, getSnapshot, () => false);

	return {
		isSupported,
		isActive,
		request: useCallback(requestWakeLock, []),
		release: useCallback(releaseWakeLock, []),
	};
}
