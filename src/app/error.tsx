"use client";

import { SystemError } from "@/components/SystemError";

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
			<Text as="p">An unexpected error occurred.</Text>

			<Button variant="solid" color="heavy" onClick={reset}>
				Refresh
			</Button>
		</SystemError>
	);
}
