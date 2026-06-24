"use client";

import { Flex } from "@bespoke/ui/Flex";
import { Grid } from "@bespoke/ui/Grid";
import { createContext, type ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/useIsMounted";
import styles from "./styles.module.css";

const SlotContext = createContext<HTMLDivElement | null>(null);

type HostProps = {
	children: ReactNode;
	left?: ReactNode;
};

export function BottomRailHost({ children, left }: HostProps) {
	const [slot, setSlot] = useState<HTMLDivElement | null>(null);

	return (
		<SlotContext.Provider value={slot}>
			<Grid
				gap={2}
				alignItems="end"
				justifyContent="space-between"
				className={styles.rail}
			>
				<div className={styles.node}>{left}</div>

				<Flex
					className={styles.node}
					gap={2}
					wrap
					alignItems="center"
					justifyContent="center"
					ref={setSlot}
				/>

				<div className={styles.node} />
			</Grid>

			{children}
		</SlotContext.Provider>
	);
}

type ItemsProps = { children: ReactNode };

export function BottomRailItems({ children }: ItemsProps) {
	const slot = useContext(SlotContext);
	const isMounted = useIsMounted();

	if (!isMounted || !slot) return null;

	return createPortal(children, slot);
}
