import type { KeyboardEvent } from "react";

const MODIFIER_KEYS = ["mod", "alt", "shift", "ctrl"] as const;

/** @public */
export const MODIFIER_KEYS_SET = new Set(MODIFIER_KEYS);

export type Platform = "mac" | "windows" | "linux";

type ModifierKey = (typeof MODIFIER_KEYS)[number];

const MODIFIER_SYMBOLS = new Map<Platform, Record<ModifierKey, string>>([
	["mac", { mod: "⌘", alt: "⌥", shift: "⇧", ctrl: "⌃" }],
	["windows", { mod: "Ctrl", alt: "Alt", shift: "Shift", ctrl: "Ctrl" }],
	["linux", { mod: "Ctrl", alt: "Alt", shift: "Shift", ctrl: "Ctrl" }],
]);

const KEY_SYMBOLS = new Map<string, Record<Platform, string>>([
	["enter", { mac: "↵", windows: "Enter", linux: "Enter" }],
	["escape", { mac: "Esc", windows: "Esc", linux: "Esc" }],
	["backspace", { mac: "⌫", windows: "Backspace", linux: "Backspace" }],
	["arrowup", { mac: "↑", windows: "↑", linux: "↑" }],
	["arrowdown", { mac: "↓", windows: "↓", linux: "↓" }],
	["arrowleft", { mac: "←", windows: "←", linux: "←" }],
	["arrowright", { mac: "→", windows: "→", linux: "→" }],
]);

export function detectPlatform(): Platform | undefined {
	if (typeof window === "undefined") {
		return undefined;
	}

	const ua = navigator.userAgent.toLowerCase();

	if (ua.includes("win")) return "windows";
	if (ua.includes("mac")) return "mac";
	if (ua.includes("linux")) return "linux";

	return undefined;
}

/** @public */
export function isModifierKey(key: string): key is ModifierKey {
	return MODIFIER_KEYS_SET.has(key as ModifierKey);
}

export function parseShortcut(
	shortcut: string,
	platform: Platform | undefined,
): string[] {
	if (!platform) {
		return shortcut.toLowerCase().split("+");
	}

	const modifiers = MODIFIER_SYMBOLS.get(platform);

	return shortcut
		.toLowerCase()
		.split("+")
		.map((s) => {
			if (modifiers && isModifierKey(s)) {
				return modifiers[s];
			}

			const keySymbol = KEY_SYMBOLS.get(s);

			if (keySymbol) {
				return keySymbol[platform];
			}

			return s.toUpperCase();
		});
}

type KeyboardEventLike = Pick<
	KeyboardEvent,
	"key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey"
>;

export function matchesShortcut(
	event: KeyboardEventLike,
	shortcut: string,
	platform: Platform | undefined,
): boolean {
	if (!platform) {
		return false;
	}

	const parts = shortcut.toLowerCase().split("+");
	const key = parts.find((s) => !isModifierKey(s));

	const needsMod = parts.includes("mod");
	const needsAlt = parts.includes("alt");
	const needsShift = parts.includes("shift");
	const needsCtrl = parts.includes("ctrl");

	const modPressed = platform === "mac" ? event.metaKey : event.ctrlKey;

	if (needsMod && !modPressed) return false;
	if (needsAlt && !event.altKey) return false;
	if (needsShift && !event.shiftKey) return false;
	if (needsCtrl && !event.ctrlKey) return false;

	return event.key.toLowerCase() === key;
}

const TEXT_INPUT_TYPES = new Set([
	"text",
	"password",
	"email",
	"number",
	"search",
	"tel",
	"url",
]);

export function isTextInputElement(target: EventTarget | null): boolean {
	if (!target || !(target instanceof HTMLElement)) {
		return false;
	}

	if (target.tagName === "TEXTAREA" || target.isContentEditable) {
		return true;
	}

	if (target instanceof HTMLInputElement) {
		return TEXT_INPUT_TYPES.has(target.type);
	}

	return false;
}

export function handleKey<T = Element>(
	args: [
		key: string,
		fn: ((event: KeyboardEvent<T>) => unknown) | undefined,
		onCondition?: (event: KeyboardEvent<T>) => boolean,
	][],
) {
	return (event: KeyboardEvent<T>) => {
		args.forEach(([key, fn, onCondition]) => {
			if (
				key === event.key &&
				(typeof onCondition === "undefined" || onCondition?.(event))
			) {
				event.preventDefault();
				fn?.(event);
			}
		});
	};
}
