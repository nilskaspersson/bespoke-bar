"use client";

import { Button } from "@bespoke/ui/Button";
import { Text } from "@bespoke/ui/Text";
import { SystemError } from "@/components/SystemError";

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
