"use client";

import { SystemError } from "@/app/components/SystemError";

import { Button } from "@/ui/Button";
import { Text } from "@/ui/Text";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<SystemError code={500} message={error.message}>
			<Text>An unexpected error occurred.</Text>

			<Button variant="solid" color="primary" onClick={reset}>
				Refresh
			</Button>
		</SystemError>
	);
}
