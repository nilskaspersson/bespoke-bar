import { useCallback, useDeferredValue, useState } from "react";
import type { CocktailStyleFilter } from "@/features/recipes/constants";

export function useCocktailStyleSelection(initial: CocktailStyleFilter[] = []) {
	const [selectedCocktailStyles, setSelectedCocktailStyles] = useState(initial);
	const deferredSelectedCocktailStyles = useDeferredValue(
		selectedCocktailStyles,
	);

	const toggleCocktailStyle = useCallback((style: CocktailStyleFilter) => {
		setSelectedCocktailStyles((prev) =>
			prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
		);
	}, []);

	const clearCocktailStyles = useCallback(
		() => setSelectedCocktailStyles([]),
		[],
	);

	return {
		selectedCocktailStyles,
		deferredSelectedCocktailStyles,
		setSelectedCocktailStyles,
		toggleCocktailStyle,
		clearCocktailStyles,
	};
}
