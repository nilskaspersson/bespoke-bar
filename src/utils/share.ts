export const isShareSupported =
	typeof navigator !== "undefined" && "share" in navigator;

export async function shareText(text: string): Promise<void> {
	if (!isShareSupported) {
		return Promise.resolve();
	}

	try {
		return await navigator.share({ text });
	} catch (_e) {}
}
