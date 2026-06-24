import "react";

declare module "react" {
	interface CSSProperties {
		[key: `--${string}`]: string | number | undefined;
	}

	interface ButtonHTMLAttributes<T> {
		commandfor?: string | undefined;
		command?: string | undefined;
	}
}
