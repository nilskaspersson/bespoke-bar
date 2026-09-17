/**
 * Zod doesn't support "image/*", so let's list the types we can expect.
 */
export const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/heic",
	"image/heif",
];

/**
 * Vercel rejects request bodies over 4.5 MB before the route handler runs; this
 * stays under it with room for the multipart envelope.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const IMAGE_TOO_LARGE_MESSAGE =
	"That photo is too large. Try a smaller one, up to 4 MB.";
