import "react";

declare module "react" {
	interface ButtonHTMLAttributes<T> {
		commandfor?: string | undefined;
		command?: string | undefined;
	}
}
