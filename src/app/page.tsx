import { LinkButton } from "@/ui/Button";
import { Container } from "@/ui/Container";
import { GradientText } from "@/ui/GradientText";
import { Heading } from "@/ui/Heading";
import { Icon } from "@/ui/Icon";
import styles from "./page.module.css";

export default async function Home() {
	return (
		<Container as="article" className={styles.main}>
			<div className={styles.content}>
				<Heading level="h1" className={styles.heading}>
					Mise en place,
					<br />
					<GradientText>beyond your bar</GradientText>
				</Heading>

				<div>
					<LinkButton href="/bar" variant="outline" color="heavy" size="large">
						Get started
						<Icon name="martini-glass" size="small" />
					</LinkButton>
				</div>
			</div>
		</Container>
	);
}
