"use client";

import { useCallback, useEffect, useState } from "react";

export function useImageUploadPreview() {
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

	const createImagePreview = useCallback((file: File) => {
		if (file.type.startsWith("image/")) {
			const objectUrl = URL.createObjectURL(file);
			setImagePreviewUrl(objectUrl);
		}
	}, []);

	const clearImagePreview = useCallback(() => {
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
			setImagePreviewUrl(null);
		}
	}, [imagePreviewUrl]);

	useEffect(() => {
		return () => {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);

	return { imagePreviewUrl, createImagePreview, clearImagePreview };
}
