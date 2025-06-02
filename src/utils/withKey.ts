import { omit } from "@/utils";

/**
 * Use for temporary fields to key React nodes.
 */
export const KEY_FIELD = "_key";

export type WithKey<T> = T & { [KEY_FIELD]: string };

export function hasKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): o is WithKey<T> {
	return Object.hasOwn(o, KEY_FIELD);
}

export function withKey<T extends Record<PropertyKey, unknown>>(
	o: T,
): WithKey<T> {
	return hasKey(o) ? o : { ...o, [KEY_FIELD]: crypto.randomUUID() };
}

export function withoutKey<T>(
	o: WithKey<T>,
): Omit<WithKey<T>, typeof KEY_FIELD> {
	return omit(o, KEY_FIELD);
}
