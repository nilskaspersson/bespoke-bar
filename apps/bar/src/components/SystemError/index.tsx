import { Container } from "@bespoke/ui/Container";
import { Heading } from "@bespoke/ui/Heading";
import { Text } from "@bespoke/ui/Text";
import styles from "./styles.module.css";

export function SystemError(props: {
	children?: React.ReactNode;
	code: number;
	message: string;
}) {
	return (
		<Container className={styles.base}>
			<div className={styles.container}>
				<Heading level="h1" size={9}>
					{props.code}
				</Heading>

				{props.children}

				{props.code === 404 ? (
					<Text as="p" compact>
						{props.message}
					</Text>
				) : null}

				{props.code !== 404 && props.message ? (
					<details className={styles.details}>
						<Text as="summary" compact>
							Show error details
						</Text>

						<Text as="div" compact>
							{props.message}
						</Text>
					</details>
				) : null}
			</div>
		</Container>
	);
}
