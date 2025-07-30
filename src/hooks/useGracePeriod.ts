import { useEffect, useState } from "react";

export function useGracePeriod(timeout: number) {
	const [isInGracePeriod, setIsInGracePeriod] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInGracePeriod(false);
		}, timeout);

		return () => clearTimeout(timer);
	}, [timeout]);

	return isInGracePeriod;
}
