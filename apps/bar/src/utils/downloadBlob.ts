type DownloadBlobOptions = {
	content: string;
	filename: string;
	mimeType: string;
};

export function downloadBlob({
	content,
	filename,
	mimeType,
}: DownloadBlobOptions) {
	const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();

	URL.revokeObjectURL(url);
}
