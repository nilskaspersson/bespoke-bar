import { DARK_MODE_MQ, THEME_STORAGE_KEY } from "./constants";

/**
 * Blocking inline script that sets `data-theme` and `color-scheme` on <html>
 * before first paint, preventing a flash of the wrong background color.
 */
const SCRIPT = `(function(){try{var t=JSON.parse(localStorage.getItem("${THEME_STORAGE_KEY}"));if(t!=="light"&&t!=="dark")t="system";if(t==="system")t=matchMedia("${DARK_MODE_MQ}").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;

export function ThemeScript() {
	return (
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Must be inline to avoid FOUC
			dangerouslySetInnerHTML={{ __html: SCRIPT }}
		/>
	);
}
