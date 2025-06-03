import { LinkButton } from "@/ui/Button";

export default function NotFound() {
	return (
		<section>
			<h1>404</h1>

			<p>The requested page could not be found.</p>

			<LinkButton href="/" variant="solid">
				Back to home
			</LinkButton>
		</section>
	);
}
