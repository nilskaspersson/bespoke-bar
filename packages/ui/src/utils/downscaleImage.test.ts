import { afterEach, describe, expect, it, vi } from "vitest";
import { downscaleImage } from "./downscaleImage";

function stubBitmap(width: number, height: number) {
	const bitmap = { width, height, close: vi.fn() };
	vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
	return bitmap;
}

function stubCanvas(blob: Blob | null) {
	const canvas = {
		width: 0,
		height: 0,
		getContext: () => ({ fillRect: vi.fn(), drawImage: vi.fn() }),
		toBlob: (callback: BlobCallback) => callback(blob),
	};
	vi.spyOn(document, "createElement").mockReturnValue(
		canvas as unknown as HTMLCanvasElement,
	);
	return canvas;
}

function photo(bytes: number, name = "IMG_0001.JPG", type = "image/jpeg") {
	return new File([new Uint8Array(bytes)], name, { type });
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("downscaleImage", () => {
	it("returns the same file when it is already small enough", async () => {
		const bitmap = stubBitmap(1600, 1200);
		const file = photo(1024);

		await expect(downscaleImage(file)).resolves.toBe(file);
		expect(bitmap.close).toHaveBeenCalled();
	});

	it("re-encodes an oversized image as a JPEG", async () => {
		const bitmap = stubBitmap(8000, 6000);
		const canvas = stubCanvas(new Blob(["jpeg"], { type: "image/jpeg" }));

		const result = await downscaleImage(photo(1024));

		expect(canvas).toMatchObject({ width: 2560, height: 1920 });
		expect(result.name).toBe("IMG_0001.jpg");
		expect(result.type).toBe("image/jpeg");
		expect(bitmap.close).toHaveBeenCalled();
	});

	it("caps the long edge of a portrait image", async () => {
		stubBitmap(3000, 4000);
		const canvas = stubCanvas(new Blob(["jpeg"], { type: "image/jpeg" }));

		await downscaleImage(photo(1024), { maxEdge: 2000 });

		expect(canvas).toMatchObject({ width: 1500, height: 2000 });
	});

	it("re-encodes an image within bounds that is over the byte limit", async () => {
		stubBitmap(1600, 1200);
		stubCanvas(new Blob(["jpeg"], { type: "image/jpeg" }));

		const result = await downscaleImage(photo(2048, "scan.png", "image/png"), {
			maxBytes: 1024,
		});

		expect(result.name).toBe("scan.jpg");
	});

	it("returns the original when the browser cannot decode it", async () => {
		vi.stubGlobal(
			"createImageBitmap",
			vi.fn().mockRejectedValue(new Error("undecodable")),
		);
		const file = photo(1024);

		await expect(downscaleImage(file)).resolves.toBe(file);
	});

	it("returns the original when encoding yields nothing", async () => {
		stubBitmap(8000, 6000);
		stubCanvas(null);
		const file = photo(1024);

		await expect(downscaleImage(file)).resolves.toBe(file);
	});
});
