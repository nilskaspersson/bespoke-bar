import { SystemError } from "@/app/components/SystemError";
import { LinkButton } from "@/ui/Button";
import { Text } from "@/ui/Text";

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
