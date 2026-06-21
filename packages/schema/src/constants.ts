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
