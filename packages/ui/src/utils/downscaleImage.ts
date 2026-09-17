import { MAX_IMAGE_BYTES } from "@bespoke/schema/constants";

type DownscaleOptions = {
	maxEdge?: number;
	maxBytes?: number;
	quality?: number;
};

function fitWithin(width: number, height: number, maxEdge: number) {
	const scale = Math.min(1, maxEdge / Math.max(width, height));

	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale)),
	};
}

function toJpegName(name: string) {
	return `${name.replace(/\.[^./]+$/, "")}.jpg`;
}

function encodeJpeg(
	bitmap: ImageBitmap,
	width: number,
	height: number,
	quality: number,
) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const context = canvas.getContext("2d");
	if (!context) return Promise.resolve(null);

	/** JPEG has no alpha; without this a transparent PNG flattens onto black. */
	context.fillStyle = "#fff";
	context.fillRect(0, 0, width, height);
	context.drawImage(bitmap, 0, 0, width, height);

	return new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, "image/jpeg", quality);
	});
}

/**
 * Re-encodes an image as a JPEG no larger than `maxEdge` on its long side.
 * Returns the original file when it's already small enough, or when the browser
 * can't decode it, leaving the server to accept or reject it.
 */
export async function downscaleImage(
	file: File,
	{
		maxEdge = 2560,
		maxBytes = MAX_IMAGE_BYTES,
		quality = 0.85,
	}: DownscaleOptions = {},
): Promise<File> {
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
	} catch {
		return file;
	}

	try {
		const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
		const isWithinBounds = width === bitmap.width && height === bitmap.height;

		if (isWithinBounds && file.size <= maxBytes) return file;

		const blob = await encodeJpeg(bitmap, width, height, quality);
		if (!blob) return file;

		return new File([blob], toJpegName(file.name), {
			type: "image/jpeg",
			lastModified: file.lastModified,
		});
	} catch {
		return file;
	} finally {
		bitmap.close();
	}
}
