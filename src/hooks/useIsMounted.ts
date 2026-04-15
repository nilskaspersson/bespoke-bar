import { useEffect, useState } from "react";

export function useIsMounted<T = undefined>(onMount?: () => T): T | undefined {
	const [value, setValue] = useState<T>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: onMount is read once at mount
	useEffect(() => {
		setValue(onMount ? onMount() : (true as T));
	}, []);

	return value;
}
