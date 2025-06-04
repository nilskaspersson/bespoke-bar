import { Container } from "@/ui/Container";
import { Text } from "@/ui/Text";
import styles from "./styles.module.css";

export function SystemError(props: {
	children?: React.ReactNode;
	code: number;
	message: string;
}) {
	return (
		<Container className={styles.base}>
			<div className={styles.container}>
				<Text as="h1" compact align="center" heavy weight={900}>
					<Text size={9} as="div" compact>
						{props.code}
					</Text>

					<Text size={6} as="div" compact>
						{props.message}
					</Text>
				</Text>

				{props.children}
			</div>
		</Container>
	);
}
