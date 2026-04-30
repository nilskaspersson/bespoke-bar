import type { ReactNode } from "react";
import { Heading } from "@/ui/Heading";
import styles from "./styles.module.css";

type Props = {
	title: string;
	children: ReactNode;
};

export function OrganisationSettings({ title, children }: Props) {
	return (
		<article>
			<Heading level="h1" className={styles.heading}>
				{title}
			</Heading>

			{children}
		</article>
	);
}
