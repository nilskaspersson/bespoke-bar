export const getAnchorPositionY = (
	anchor: DOMRect | undefined,
	origin: DOMRect | undefined,
	position: "top" | "bottom" | "center",
) => {
	if (anchor == null || origin == null) {
		return 0;
	}

	switch (position) {
		case "top":
			return anchor.top - origin.height;

		case "bottom":
			return anchor.bottom;

		case "center":
			return anchor.top + anchor.height / 2 - origin.height / 2;
	}
};

export const getAnchorPositionX = (
	anchor: DOMRect | undefined,
	origin: DOMRect | undefined,
	position: "left" | "right" | "center",
) => {
	if (anchor == null || origin == null) {
		return 0;
	}

	switch (position) {
		case "left":
			return anchor.left - origin.width;

		case "right":
			return anchor.right;

		case "center":
			return anchor.left + anchor.width / 2 - origin.width / 2;
	}
};
