import { LinkButton } from "@bespoke/ui/Button";
import { SystemError } from "@/components/SystemError";

export default function NotFound() {
	return (
		<SystemError code={404} message="The requested page could not be found.">
			<LinkButton href="/" variant="outline" color="heavy">
				Back to home
			</LinkButton>
		</SystemError>
	);
}
