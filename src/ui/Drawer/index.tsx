import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/ui/Button";
import { Container } from "@/ui/Container";
import styles from "./styles.module.css";

type DrawerProps = {
	actions?: ReactNode;
	header?: ReactNode;
	onClose?: () => void;
};

export function Drawer({
	children,
	actions,
	header,
	onClose,
	className,
	...props
}: ComponentProps<"dialog"> & DrawerProps) {
	return (
		<dialog
			className={clsx(styles.drawer, className)}
			closedby="any"
			{...props}
		>
			<Container className={styles.container} padding={false}>
				{header ? <header className={styles.header}>{header}</header> : null}

				<div className={styles.content}>{children}</div>

				<footer className={styles.footer}>
					<menu className={styles.actions}>
						<li>
							<form method="dialog">
								<Button type="submit" variant="ghost" size="tiny">
									Cancel
								</Button>
							</form>
						</li>

						{actions}
					</menu>
				</footer>
			</Container>
		</dialog>
	);
}
