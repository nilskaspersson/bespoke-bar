import { LinkButton } from "@bespoke/ui/Button";
import { Text } from "@bespoke/ui/Text";
import { SystemError } from "@/components/SystemError";

export default function ForbiddenPage() {
	return (
		<SystemError code={403} message="Forbidden">
			<Text>You are not authorized to view this page.</Text>

			<LinkButton href="/" variant="outline" color="heavy">
				Back to home
			</LinkButton>
		</SystemError>
	);
}
