"use client";

import { clsx } from "clsx";
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
			<div className={styles.rail}>
				<div className={styles.node}>{left}</div>
				<div className={clsx(styles.node, styles.middle)} ref={setSlot} />
				<div className={clsx(styles.node, styles.right)} />
			</div>

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
